import type { Transaction, TransactionRequest } from "./shared";

// Phase 1 — local activities (fast, in-process, no server round-trips).

export async function validateTransaction(req: TransactionRequest): Promise<Transaction> {
  console.log(`Validating ${req.amount} ${req.currency}`);
  if (req.amount <= 0) {
    throw new Error(`Invalid amount: ${req.amount}`);
  }
  return { id: `tx-${Date.now()}`, status: "initialized" };
}

export async function reserveFunds(tx: Transaction): Promise<Transaction> {
  console.log(`Reserving funds for ${tx.id}`);
  return { id: tx.id, status: "reserved" };
}

// Phase 2 — regular activity (may be slow / remote).

export async function settleTransaction(tx: Transaction): Promise<Transaction> {
  // Simulate slow background settlement so the early-return effect is visible.
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log(`Settled transaction ${tx.id}`);
  return { id: tx.id, status: "completed" };
}

export async function cancelTransaction(tx: Transaction | undefined): Promise<void> {
  console.log(`Cancelled transaction ${tx?.id ?? "(uninitialized)"}`);
}
