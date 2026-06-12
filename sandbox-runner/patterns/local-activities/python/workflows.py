from datetime import timedelta
from temporalio import workflow
from temporalio.common import RetryPolicy

with workflow.unsafe.imports_passed_through():
    from activities import validate_transaction, reserve_funds, settle_transaction
    from shared import Transaction, TransactionRequest


@workflow.defn
class TransactionWorkflow:
    @workflow.run
    async def run(self, req: TransactionRequest) -> Transaction:
        # All three activities run as local activities — no server round-trips,
        # no extra WFT scheduling latency between phases.
        tx = await workflow.execute_local_activity(
            validate_transaction,
            req,
            schedule_to_close_timeout=timedelta(seconds=10),
            retry_policy=RetryPolicy(maximum_attempts=1),
        )
        tx = await workflow.execute_local_activity(
            reserve_funds,
            tx,
            schedule_to_close_timeout=timedelta(seconds=10),
            retry_policy=RetryPolicy(maximum_attempts=1),
        )
        tx = await workflow.execute_local_activity(
            settle_transaction,
            tx,
            schedule_to_close_timeout=timedelta(seconds=10),
            retry_policy=RetryPolicy(maximum_attempts=1),
        )
        return tx
