"""
Eager Workflow Start demo: worker and starter run in the same process.

The worker is started as a background task before the workflow is executed.
The Temporal client is created with request_eager_start=True so the server can
dispatch the first workflow task directly to this worker — bypassing the
Matching Service queue and removing one server round-trip.
"""

import asyncio
import time

from temporalio.client import Client
from temporalio.worker import Worker
from activities import validate_transaction, reserve_funds, settle_transaction
from workflows import TransactionWorkflow
from shared import TASK_QUEUE, WORKFLOW_ID_PREFIX, TransactionRequest


async def main() -> None:
    client = await Client.connect("localhost:7233")

    # Start the worker as a background task in the same event loop so it is
    # registered on the task queue before we execute the workflow.
    worker = Worker(
        client,
        task_queue=TASK_QUEUE,
        workflows=[TransactionWorkflow],
        activities=[validate_transaction, reserve_funds, settle_transaction],
    )
    worker_task = asyncio.create_task(worker.run())

    # Give the worker a moment to register with the server.
    await asyncio.sleep(0.5)

    print(f"Worker started on task queue: {TASK_QUEUE}")

    req = TransactionRequest(amount=100.0, currency="USD")
    workflow_id = f"{WORKFLOW_ID_PREFIX}-{int(time.time() * 1000)}"

    t0 = time.monotonic()
    result = await client.execute_workflow(
        TransactionWorkflow.run,
        req,
        id=workflow_id,
        task_queue=TASK_QUEUE,
        # request_eager_start tells the server to dispatch the first WFT directly
        # to this co-located worker process rather than going through Matching.
        request_eager_start=True,
    )
    elapsed_ms = int((time.monotonic() - t0) * 1000)
    print(f"Transaction complete after {elapsed_ms}ms: ID={result.id} Status={result.status}")

    worker_task.cancel()
    try:
        await worker_task
    except asyncio.CancelledError:
        pass


if __name__ == "__main__":
    asyncio.run(main())
