import asyncio
from temporalio.client import Client
from temporalio.worker import Worker
from activities import validate_transaction, reserve_funds, settle_transaction, cancel_transaction
from workflows import TransactionWorkflow
from shared import TASK_QUEUE


async def main() -> None:
    client = await Client.connect("localhost:7233")
    worker = Worker(
        client,
        task_queue=TASK_QUEUE,
        workflows=[TransactionWorkflow],
        activities=[validate_transaction, reserve_funds, settle_transaction, cancel_transaction],
    )
    print(f"Worker started on task queue: {TASK_QUEUE}")
    await worker.run()


if __name__ == "__main__":
    asyncio.run(main())
