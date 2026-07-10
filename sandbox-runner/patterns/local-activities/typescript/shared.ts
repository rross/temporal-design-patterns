export const TASK_QUEUE = "local-activities-task-queue";
export const WORKFLOW_ID_PREFIX = "transaction";

export interface TransactionRequest {
  amount: number;
  currency: string;
}

export interface Transaction {
  id: string;
  status: string;
}
