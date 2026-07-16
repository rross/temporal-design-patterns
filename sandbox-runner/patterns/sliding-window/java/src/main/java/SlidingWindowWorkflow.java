import io.temporal.activity.ActivityOptions;
import io.temporal.api.enums.v1.ParentClosePolicy;
import io.temporal.workflow.*;

import java.time.Duration;
import java.util.*;

public interface SlidingWindowWorkflow {

    /** Parent workflow: maintains a fixed window of concurrent child workflows. */
    @WorkflowInterface
    interface Parent {
        @WorkflowMethod
        int run(Shared.SlidingWindowInput input);

        @SignalMethod
        void recordCompleted(String recordId);
    }

    /** Child workflow: processes one record and signals the parent on completion. */
    @WorkflowInterface
    interface Child {
        @WorkflowMethod
        void run(String recordId);
    }

    final class ParentImpl implements Parent {
        // Live in-flight count: +1 per start, -1 per completion signal, carried across runs.
        // Instance field (not a run() local) because the signal handler is a separate
        // method and completions can signal before run() starts.
        private int active = 0;
        // Total records completed across all runs, carried over via Continue-as-New.
        private int totalProcessed = 0;

        @Override
        public void recordCompleted(String recordId) {
            active--;
            totalProcessed++;
        }

        @Override
        public int run(Shared.SlidingWindowInput input) {
            // Use += so completions that signal before run() starts are preserved; an
            // early signal already pushed active negative, so folding input.active in
            // yields the correct remaining count.
            this.totalProcessed += input.totalProcessed;
            this.active += input.active;
            int windowSize = input.windowSize > 0 ? input.windowSize : Shared.WINDOW_SIZE;
            List<String> recordIds = input.recordIds;
            String parentId = Workflow.getInfo().getWorkflowId();
            int nextIndex = input.startIndex;
            // Children started in this run; triggers Continue-as-New once it hits windowSize.
            int dispatched = 0;

            // Slide the window: keep the window full, starting one child per free slot.
            // The first (windowSize - active) slots are already free, so those children
            // start without waiting; after that, each start waits for an in-flight child
            // to signal that its slot has freed.
            while (nextIndex < recordIds.size()) {
                // Backpressure: block until the window has a free slot. Returns immediately
                // when one is free; when full it waits for a child's completion signal to
                // decrement active via the handler.
                Workflow.await(() -> active < windowSize);

                String recordId = recordIds.get(nextIndex);
                ChildWorkflowOptions opts = ChildWorkflowOptions.newBuilder()
                        .setWorkflowId(parentId + "/record-" + recordId)
                        .setTaskQueue(Shared.TASK_QUEUE)
                        .setParentClosePolicy(ParentClosePolicy.PARENT_CLOSE_POLICY_ABANDON)
                        .build();
                Child child = Workflow.newChildWorkflowStub(Child.class, opts);
                Async.procedure(child::run, recordId);
                // Wait until the child has actually started before counting it (and before
                // any Continue-as-New, which would otherwise race child startup).
                Workflow.getWorkflowExecution(child).get();
                nextIndex++;
                dispatched++;
                active++;

                // Once this run has filled the window with fresh children, continue-as-new
                // so history stays bounded. Carry active (the live in-flight count) so the
                // next run knows exactly how many children will still signal it.
                if (dispatched >= windowSize) {
                    Workflow.getLogger(ParentImpl.class)
                            .info("ContinueAsNew: nextIndex={} totalProcessed={}", nextIndex, this.totalProcessed);
                    Workflow.newContinueAsNewStub(Parent.class)
                            .run(new Shared.SlidingWindowInput(
                                    recordIds, windowSize, nextIndex, this.totalProcessed, active));
                    return 0; // unreachable; CAN throws
                }
            }

            // Wait for all remaining in-flight children to complete.
            Workflow.await(() -> active == 0);
            Workflow.getLogger(ParentImpl.class)
                    .info("Sliding window complete: total={} totalProcessed={}",
                            recordIds.size(), this.totalProcessed);
            return this.totalProcessed;
        }
    }

    final class ChildImpl implements Child {
        private final Activities activities = Workflow.newActivityStub(
                Activities.class,
                ActivityOptions.newBuilder()
                        .setStartToCloseTimeout(Duration.ofSeconds(30))
                        .build());

        @Override
        public void run(String recordId) {
            activities.processRecord(recordId);
            Workflow.getLogger(ChildImpl.class).info("Processed record: {}", recordId);

            // Signal the parent that this slot is now free. The parent's workflow ID is
            // read from context and is stable across the parent's Continue-as-New runs.
            // Ignore if the parent has already completed (final run finished before us).
            String parentWorkflowId = Workflow.getInfo().getParentWorkflowId().orElseThrow();
            ExternalWorkflowStub parent = Workflow.newUntypedExternalWorkflowStub(parentWorkflowId);
            try {
                parent.signal(Shared.COMPLETION_SIGNAL, recordId);
            } catch (Exception e) {
                String msg = e.getMessage() != null ? e.getMessage() : "";
                if (msg.contains("workflow not found") || msg.contains("not found")) {
                    Workflow.getLogger(ChildImpl.class)
                            .info("Parent already completed, signal not needed: {}", recordId);
                } else {
                    throw e;
                }
            }
        }
    }
}
