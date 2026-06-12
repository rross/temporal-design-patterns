import time
from temporalio import activity
from shared import Transaction, TransactionRequest


@activity.defn
async def validate_transaction(req: TransactionRequest) -> Transaction:
    if req.amount <= 0:
        raise ValueError(f"Invalid amount: {req.amount}")
    tx_id = f"tx-{int(time.time() * 1000)}"
    return Transaction(id=tx_id, status="initialized")


@activity.defn
async def reserve_funds(tx: Transaction) -> Transaction:
    return Transaction(id=tx.id, status="reserved")


@activity.defn
async def settle_transaction(tx: Transaction) -> Transaction:
    return Transaction(id=tx.id, status="completed")
