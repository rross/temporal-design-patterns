package main

const (
	TaskQueue        = "eager-workflow-start-task-queue"
	WorkflowIDPrefix = "transaction"
)

type TransactionRequest struct {
	Amount   float64 `json:"amount"`
	Currency string  `json:"currency"`
}

type Transaction struct {
	ID     string `json:"id"`
	Status string `json:"status"`
}
