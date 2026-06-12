package main

import (
	"context"
	"fmt"
	"time"

	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"
)

// main starts a worker in non-blocking mode, then executes a workflow with
// EnableEagerStart so the server can dispatch the first WFT directly to this
// process — bypassing the Matching Service queue.
func main() {
	c, err := client.Dial(client.Options{HostPort: "localhost:7233"})
	if err != nil {
		panic(err)
	}
	defer c.Close()

	// Start the worker in non-blocking mode so we can run the starter in the
	// same process.  The server needs a running worker registered on this task
	// queue before it can eagerly dispatch the first WFT.
	w := worker.New(c, TaskQueue, worker.Options{})
	w.RegisterWorkflow(TransactionWorkflow)
	w.RegisterActivity(ValidateTransaction)
	w.RegisterActivity(ReserveFunds)
	w.RegisterActivity(SettleTransaction)

	if err := w.Start(); err != nil {
		panic(err)
	}
	defer w.Stop()

	fmt.Printf("Worker started on task queue: %s\n", TaskQueue)

	// Execute the workflow with EnableEagerStart.  The server will attempt to
	// dispatch the first workflow task directly to this worker process.
	req := TransactionRequest{Amount: 100.0, Currency: "USD"}
	workflowID := fmt.Sprintf("%s-%d", WorkflowIDPrefix, time.Now().UnixMilli())

	t0 := time.Now()
	we, err := c.ExecuteWorkflow(context.Background(), client.StartWorkflowOptions{
		ID:               workflowID,
		TaskQueue:        TaskQueue,
		EnableEagerStart: true,
	}, TransactionWorkflow, req)
	if err != nil {
		panic(err)
	}

	var tx Transaction
	if err := we.Get(context.Background(), &tx); err != nil {
		panic(err)
	}
	fmt.Printf("Transaction complete after %dms: ID=%s Status=%s\n",
		time.Since(t0).Milliseconds(), tx.ID, tx.Status)
}
