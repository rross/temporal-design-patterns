import {
  condition,
  defineUpdate,
  proxyActivities,
  proxyLocalActivities,
  setHandler,
} from "@temporalio/workflow";

import type * as activities from "./activities";
import type { Transaction, TransactionRequest } from "./shared";

// Phase 1: validate + reserve run as local activities (no server round-trip).
const { validateTransaction, reserveFunds } = proxyLocalActivities<typeof activities>({
  scheduleToCloseTimeout: "10 seconds",
});

// Phase 2: settle runs as a regular activity (background, potentially slow).
const { settleTransaction, cancelTransaction } = proxyActivities<typeof activities>({
  startToCloseTimeout: "30 seconds",
});

export const returnInitResultUpdate = defineUpdate<Transaction>("returnInitResult");

export async function transactionWorkflow(req: TransactionRequest): Promise<Transaction | null> {
  let tx: Transaction | undefined;
  let initDone = false;
  let initError: Error | undefined;

  setHandler(returnInitResultUpdate, async () => {
    // Block until Phase 1 (local activities) completes.
    await condition(() => initDone);
    if (initError) {
      throw initError;
    }
    return tx!;
  });

  // Phase 1: fast — runs entirely in-process.
  try {
    tx = await validateTransaction(req);
    tx = await reserveFunds(tx);
  } catch (err) {
    initError = err as Error;
  } finally {
    initDone = true;
  }

  if (initError) {
    await cancelTransaction(tx);
    return null;
  }

  // Phase 2: slow — background settlement.
  tx = await settleTransaction(tx!);
  return tx;
}
