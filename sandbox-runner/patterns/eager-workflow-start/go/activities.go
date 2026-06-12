package main

import (
	"context"
	"errors"
	"fmt"
	"time"
)

func ValidateTransaction(_ context.Context, req TransactionRequest) (*Transaction, error) {
	if req.Amount <= 0 {
		return nil, errors.New("invalid transaction amount")
	}
	return &Transaction{
		ID:     fmt.Sprintf("tx-%d", time.Now().UnixMilli()),
		Status: "initialized",
	}, nil
}

func ReserveFunds(_ context.Context, tx *Transaction) (*Transaction, error) {
	return &Transaction{ID: tx.ID, Status: "reserved"}, nil
}

func SettleTransaction(_ context.Context, tx *Transaction) (*Transaction, error) {
	return &Transaction{ID: tx.ID, Status: "completed"}, nil
}
