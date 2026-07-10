import { Client, Connection } from "@temporalio/client";
import { transactionWorkflow } from "./workflows";
import { TASK_QUEUE, WORKFLOW_ID_PREFIX, TransactionRequest } from "./shared";

async function main() {
  const connection = await Connection.connect({ address: "localhost:7233" });
  const client = new Client({ connection });

  const req: TransactionRequest = { amount: 100.0, currency: "USD" };
  const result = await client.workflow.execute(transactionWorkflow, {
    taskQueue: TASK_QUEUE,
    workflowId: `${WORKFLOW_ID_PREFIX}-local-activities-demo`,
    args: [req],
  });
  console.log(`Transaction complete: ID=${result.id} Status=${result.status}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
