import {
  ApplicationFailure,
  ParentClosePolicy,
  condition,
  continueAsNew,
  defineSignal,
  getExternalWorkflowHandle,
  log,
  proxyActivities,
  setHandler,
  startChild,
  workflowInfo,
} from "@temporalio/workflow";

import type * as activities from "./activities";
import { COMPLETION_SIGNAL, TASK_QUEUE, WINDOW_SIZE, type SlidingWindowInput } from "./shared";

const { processRecord } = proxyActivities<typeof activities>({
  startToCloseTimeout: "30 seconds",
});

export const completionSignal = defineSignal<[string]>(COMPLETION_SIGNAL);

/**
 * Child workflow: processes one record and signals the parent on completion.
 * The parent's workflow ID is read from context and is stable across the
 * parent's continueAsNew runs.
 */
export async function recordProcessorWorkflow(recordId: string): Promise<void> {
  await processRecord(recordId);
  log.info(`Processed record`, { recordId });

  // Signal the parent that this slot is now free.
  // Ignore if the parent has already completed (final run finished before us).
  try {
    const parent = getExternalWorkflowHandle(workflowInfo().parent!.workflowId);
    await parent.signal(completionSignal, recordId);
  } catch (err) {
    if (err instanceof ApplicationFailure && err.type === 'NOT_FOUND') {
      log.info('Parent already completed, signal not needed', { recordId });
    } else {
      throw err;
    }
  }
}

/**
 * Parent workflow: maintains a fixed window of concurrent child workflows.
 * Calls continueAsNew after dispatching windowSize children so history stays bounded.
 * Children signal back to free a slot; the parent starts the next child immediately.
 */
export async function slidingWindowWorkflow(input: SlidingWindowInput): Promise<number> {
  const {
    recordIds,
    windowSize = WINDOW_SIZE,
    startIndex = 0,
  } = input;
  const parentId = workflowInfo().workflowId;
  // Total records completed across all runs, carried over via continue-as-new.
  let totalProcessed = input.totalProcessed ?? 0;
  // Children started in this run; triggers continue-as-new once it hits windowSize.
  let dispatched = 0;
  // Live in-flight count: +1 per start, -1 per completion signal, carried across runs.
  let active = input.active ?? 0;

  setHandler(completionSignal, () => {
    active--;
    totalProcessed++;
  });

  // Slide the window: keep the window full, starting one child per free slot.
  // The first (windowSize - active) slots are already free, so those children
  // start without waiting; after that, each start waits for an in-flight child
  // to signal that its slot has freed.
  let nextIndex = startIndex;

  while (nextIndex < recordIds.length) {
    // Backpressure: block until the window has a free slot. When one is already
    // free (active < windowSize) this returns immediately; when full it waits
    // for a child's completion signal to decrement active via the handler.
    await condition(() => active < windowSize);
    await startChild(recordProcessorWorkflow, {
      args: [recordIds[nextIndex]],
      workflowId: `${parentId}/record-${recordIds[nextIndex]}`,
      taskQueue: TASK_QUEUE,
      parentClosePolicy: ParentClosePolicy.ABANDON,
    });
    nextIndex++;
    dispatched++;
    active++;

    // Once this run has filled the window with fresh children, continue-as-new
    // so history stays bounded. Carry active (the live in-flight count) so the
    // next run knows exactly how many children will still signal it.
    if (dispatched >= windowSize) {
      log.info(`ContinueAsNew`, { nextIndex, totalProcessed });
      await continueAsNew<typeof slidingWindowWorkflow>({ recordIds, windowSize, startIndex: nextIndex, totalProcessed, active });
    }
  }

  // Wait for all remaining in-flight children to complete.
  await condition(() => active === 0);
  log.info(`Sliding window complete`, { total: recordIds.length, totalProcessed });
  return totalProcessed;
}
