import { Client, Connection, WithStartWorkflowOperation } from "@temporalio/client";

import { TASK_QUEUE, WORKFLOW_ID_PREFIX, type TransactionRequest } from "./shared";
import { returnInitResultUpdate, transactionWorkflow } from "./workflows";

async function main(): Promise<void> {
  const connection = await Connection.connect();
  try {
    const client = new Client({ connection });
    const workflowId = `${WORKFLOW_ID_PREFIX}-${Date.now()}`;
    const req: TransactionRequest = { amount: 100, currency: "USD" };

    const startOp = new WithStartWorkflowOperation(transactionWorkflow, {
      workflowId,
      args: [req],
      taskQueue: TASK_QUEUE,
      workflowIdConflictPolicy: "FAIL",
    });

    const t0 = Date.now();
    // UpdateWithStart: start the workflow AND get the Phase 1 result atomically.
    // The update handler returns as soon as local activities (Phase 1) complete.
    const tx = await client.workflow.executeUpdateWithStart(returnInitResultUpdate, {
      startWorkflowOperation: startOp,
    });
    console.log(
      `Early return after ${Date.now() - t0}ms: ID=${tx.id} Status=${tx.status}`,
    );

    const handle = await startOp.workflowHandle();
    const final = await handle.result();
    console.log(`Workflow completed after ${Date.now() - t0}ms: ${JSON.stringify(final)}`);
    console.log(`Open the Temporal UI and search for '${workflowId}' to see the history.`);
  } finally {
    await connection.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
