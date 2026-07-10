import asyncio
import time
from temporalio.client import Client
from workflows import TransactionWorkflow
from shared import TASK_QUEUE, WORKFLOW_ID_PREFIX, TransactionRequest


async def main() -> None:
    client = await Client.connect("localhost:7233")

    req = TransactionRequest(amount=100.0, currency="USD")
    workflow_id = f"{WORKFLOW_ID_PREFIX}-{int(time.time() * 1000)}"

    t0 = time.monotonic()
    result = await client.execute_workflow(
        TransactionWorkflow.run,
        req,
        id=workflow_id,
        task_queue=TASK_QUEUE,
    )
    elapsed_ms = int((time.monotonic() - t0) * 1000)
    print(f"Transaction complete after {elapsed_ms}ms: ID={result.id} Status={result.status}")


if __name__ == "__main__":
    asyncio.run(main())
