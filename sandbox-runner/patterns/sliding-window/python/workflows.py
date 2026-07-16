from datetime import timedelta

from temporalio import workflow
from temporalio.exceptions import ApplicationError
from temporalio.workflow import ParentClosePolicy, continue_as_new

from activities import process_record
from shared import COMPLETION_SIGNAL, TASK_QUEUE, WINDOW_SIZE, SlidingWindowInput


@workflow.defn
class RecordProcessorWorkflow:
    """Child workflow: processes one record and signals the parent on completion."""

    @workflow.run
    async def run(self, record_id: str) -> None:
        await workflow.execute_activity(
            process_record,
            record_id,
            start_to_close_timeout=timedelta(seconds=30),
        )
        workflow.logger.info(f"Processed record: {record_id}")

        # Signal the parent that this slot is now free. The parent's workflow ID is
        # read from context and is stable across the parent's continue_as_new runs.
        # Ignore if the parent has already completed (final run finished before us).
        parent = workflow.get_external_workflow_handle(workflow.info().parent.workflow_id)
        try:
            await parent.signal(COMPLETION_SIGNAL, record_id)
        except ApplicationError as e:
            if "not found" in str(e).lower():
                workflow.logger.info(f"Parent already completed, signal not needed: {record_id}")
            else:
                raise


@workflow.defn
class SlidingWindowWorkflow:
    """Parent workflow: maintains a fixed window of concurrent child workflows.
    Calls continue_as_new after dispatching window_size children."""

    def __init__(self) -> None:
        # Live in-flight count: +1 per start, -1 per completion signal, carried across runs.
        # Instance field (not a run() local) because the signal handler is a separate
        # method and completions can signal before run() starts.
        self._active = 0
        # Total records completed across all runs, carried over via continue-as-new.
        self._total_processed = 0

    @workflow.signal(name=COMPLETION_SIGNAL)
    def record_completed(self, record_id: str) -> None:
        self._active -= 1
        self._total_processed += 1

    @workflow.run
    async def run(self, input: SlidingWindowInput) -> int:
        # Use += so any completions that signal before run() starts are preserved.
        # An early signal already pushed _active negative, so folding input.active
        # in yields the correct remaining count.
        self._total_processed += input.total_processed
        self._active += input.active
        record_ids = input.record_ids
        window_size = input.window_size
        start_index = input.start_index
        parent_id = workflow.info().workflow_id
        next_index = start_index
        # Children started in this run; triggers continue-as-new once it hits window_size.
        dispatched = 0

        # Slide the window: keep the window full, starting one child per free slot.
        # The first (window_size - active) slots are already free, so those
        # children start without waiting; after that, each start waits for an
        # in-flight child to signal that its slot has freed.
        while next_index < len(record_ids):
            # Backpressure: block until the window has a free slot. Returns
            # immediately when one is free; when full it waits for a child's
            # completion signal to decrement _active via the handler.
            await workflow.wait_condition(lambda: self._active < window_size)
            await workflow.start_child_workflow(
                RecordProcessorWorkflow.run,
                record_ids[next_index],
                id=f"{parent_id}/record-{record_ids[next_index]}",
                task_queue=TASK_QUEUE,
                parent_close_policy=ParentClosePolicy.ABANDON,
            )
            next_index += 1
            dispatched += 1
            self._active += 1

            # Once this run has filled the window with fresh children, continue-as-new
            # so history stays bounded. Carry _active (the live in-flight count) so the
            # next run knows exactly how many children will still signal it.
            if dispatched >= window_size:
                workflow.logger.info(f"ContinueAsNew: nextIndex={next_index} totalProcessed={self._total_processed}")
                continue_as_new(args=[SlidingWindowInput(
                    record_ids=record_ids,
                    window_size=window_size,
                    start_index=next_index,
                    total_processed=self._total_processed,
                    active=self._active,
                )])

        # Wait for all remaining in-flight children to complete.
        await workflow.wait_condition(lambda: self._active == 0)
        workflow.logger.info(f"Sliding window complete: total={len(record_ids)} totalProcessed={self._total_processed}")
        return self._total_processed
