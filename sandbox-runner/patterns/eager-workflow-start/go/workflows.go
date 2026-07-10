package main

import (
	"time"

	"go.temporal.io/sdk/workflow"
)

// TransactionWorkflow uses local activities for all three phases.
// When combined with Eager Workflow Start, the Temporal server dispatches
// the first WFT directly to the co-located worker — bypassing the Matching
// Service queue — which eliminates one server round-trip (~100ms).
func TransactionWorkflow(ctx workflow.Context, req TransactionRequest) (*Transaction, error) {
	localCtx := workflow.WithLocalActivityOptions(ctx, workflow.LocalActivityOptions{
		ScheduleToCloseTimeout: 10 * time.Second,
	})

	var tx *Transaction
	if err := workflow.ExecuteLocalActivity(localCtx, ValidateTransaction, req).Get(localCtx, &tx); err != nil {
		return nil, err
	}
	if err := workflow.ExecuteLocalActivity(localCtx, ReserveFunds, tx).Get(localCtx, &tx); err != nil {
		return nil, err
	}
	if err := workflow.ExecuteLocalActivity(localCtx, SettleTransaction, tx).Get(localCtx, &tx); err != nil {
		return nil, err
	}
	return tx, nil
}
