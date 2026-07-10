import asyncio
import time
from temporalio import activity
from shared import Transaction, TransactionRequest


# Phase 1 — local activities (fast, in-process, no server round-trips).

@activity.defn
async def validate_transaction(req: TransactionRequest) -> Transaction:
    if req.amount <= 0:
        raise ValueError(f"Invalid amount: {req.amount}")
    return Transaction(id=f"tx-{int(time.time() * 1000)}", status="initialized")


@activity.defn
async def reserve_funds(tx: Transaction) -> Transaction:
    return Transaction(id=tx.id, status="reserved")


# Phase 2 — regular activity (may be slow / remote).

@activity.defn
async def settle_transaction(tx: Transaction) -> Transaction:
    # Simulate slow background settlement so the early-return effect is visible.
    await asyncio.sleep(2)
    return Transaction(id=tx.id, status="completed")


@activity.defn
async def cancel_transaction(tx: Transaction | None) -> None:
    tx_id = tx.id if tx else "(uninitialized)"
    print(f"Cancelled transaction {tx_id}")
