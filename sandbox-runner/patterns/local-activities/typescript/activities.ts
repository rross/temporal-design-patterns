import { TransactionRequest, Transaction } from "./shared";

export async function validateTransaction(req: TransactionRequest): Promise<Transaction> {
  console.log(`Validating ${req.amount} ${req.currency}`);
  if (req.amount <= 0) throw new Error(`Invalid amount: ${req.amount}`);
  return { id: `tx-${Date.now()}`, status: "initialized" };
}

export async function reserveFunds(tx: Transaction): Promise<Transaction> {
  console.log(`Reserving funds for transaction ${tx.id}`);
  return { id: tx.id, status: "reserved" };
}

export async function settleTransaction(tx: Transaction): Promise<Transaction> {
  console.log(`Settling transaction ${tx.id}`);
  return { id: tx.id, status: "completed" };
}
