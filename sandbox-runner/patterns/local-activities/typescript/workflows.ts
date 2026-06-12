import { proxyLocalActivities } from "@temporalio/workflow";
import type * as activities from "./activities";
import type { TransactionRequest, Transaction } from "./shared";

// All activities run as local activities — no server round-trips.
const { validateTransaction, reserveFunds, settleTransaction } =
  proxyLocalActivities<typeof activities>({ scheduleToCloseTimeout: "10s" });

export async function transactionWorkflow(req: TransactionRequest): Promise<Transaction> {
  let tx = await validateTransaction(req);
  tx = await reserveFunds(tx);
  tx = await settleTransaction(tx);
  return tx;
}
