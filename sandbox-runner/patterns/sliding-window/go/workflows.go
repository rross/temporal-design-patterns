package main

import (
	"fmt"
	"strings"
	"time"

	enums "go.temporal.io/api/enums/v1"
	"go.temporal.io/sdk/workflow"
)

// RecordProcessorWorkflow is the child workflow that processes one record
// and signals the parent on completion.
func RecordProcessorWorkflow(ctx workflow.Context, recordID string) error {
	ao := workflow.ActivityOptions{StartToCloseTimeout: 30 * time.Second}
	ctx = workflow.WithActivityOptions(ctx, ao)

	if err := workflow.ExecuteActivity(ctx, ProcessRecord, recordID).Get(ctx, nil); err != nil {
		return err
	}
	workflow.GetLogger(ctx).Info("Processed record", "recordID", recordID)

	// Signal the parent that this slot is now free. The parent's workflow ID is
	// read from context and is stable across the parent's ContinueAsNew runs.
	// Ignore if the parent has already completed (final run finished before us).
	parentWorkflowID := workflow.GetInfo(ctx).ParentWorkflowExecution.ID
	err := workflow.SignalExternalWorkflow(ctx, parentWorkflowID, "", CompletionSignal, recordID).Get(ctx, nil)
	if err != nil && strings.Contains(err.Error(), "not found") {
		workflow.GetLogger(ctx).Info("Parent already completed, signal not needed", "recordID", recordID)
		return nil
	}
	return err
}

// SlidingWindowWorkflow is the parent workflow that maintains a fixed window of
// concurrent child workflows. It calls ContinueAsNew after dispatching windowSize
// children so history stays bounded.
func SlidingWindowWorkflow(ctx workflow.Context, input SlidingWindowInput) (int, error) {
	windowSize := input.WindowSize
	if windowSize <= 0 {
		windowSize = WindowSize
	}
	recordIDs := input.RecordIDs
	startIndex := input.StartIndex
	// Total records completed across all runs, carried over via ContinueAsNew.
	totalProcessed := input.TotalProcessed
	parentID := workflow.GetInfo(ctx).WorkflowExecution.ID

	completedCh := workflow.GetSignalChannel(ctx, CompletionSignal)
	// Children started in this run; triggers ContinueAsNew once it hits windowSize.
	dispatched := 0
	// Live in-flight count: +1 per start, -1 per completion signal, carried across runs.
	active := input.Active

	startChild := func(recordID string) error {
		cwo := workflow.ChildWorkflowOptions{
			WorkflowID:        fmt.Sprintf("%s/record-%s", parentID, recordID),
			TaskQueue:         TaskQueue,
			ParentClosePolicy: enums.PARENT_CLOSE_POLICY_ABANDON,
		}
		future := workflow.ExecuteChildWorkflow(workflow.WithChildOptions(ctx, cwo), RecordProcessorWorkflow, recordID)
		// Wait for the child to be started so the command is committed before any ContinueAsNew.
		return future.GetChildWorkflowExecution().Get(ctx, nil)
	}

	// Slide the window: keep the window full, starting one child per free slot.
	// The first (windowSize - active) slots are already free, so those children
	// start without waiting; after that, each start waits for an in-flight child
	// to signal that its slot has freed.
	nextIndex := startIndex
	for nextIndex < len(recordIDs) {
		// Backpressure: if the window is full, block on the completion channel
		// until an in-flight child signals, freeing a slot (active--). When a slot
		// is already free (active < windowSize), start without waiting.
		if active >= windowSize {
			completedCh.Receive(ctx, nil)
			totalProcessed++
			active--
		}
		if err := startChild(recordIDs[nextIndex]); err != nil {
			return 0, err
		}
		nextIndex++
		dispatched++
		active++

		// Once this run has filled the window with fresh children, continue-as-new
		// so history stays bounded. Carry active (the live in-flight count) so the
		// next run knows exactly how many children will still signal it.
		if dispatched >= windowSize {
			workflow.GetLogger(ctx).Info("ContinueAsNew", "nextIndex", nextIndex, "totalProcessed", totalProcessed)
			return 0, workflow.NewContinueAsNewError(ctx, SlidingWindowWorkflow, SlidingWindowInput{
				RecordIDs:      recordIDs,
				WindowSize:     windowSize,
				StartIndex:     nextIndex,
				TotalProcessed: totalProcessed,
				Active:         active,
			})
		}
	}

	// Drain all remaining in-flight children.
	for active > 0 {
		completedCh.Receive(ctx, nil)
		totalProcessed++
		active--
	}
	workflow.GetLogger(ctx).Info("Sliding window complete", "total", len(recordIDs), "totalProcessed", totalProcessed)
	return totalProcessed, nil
}
