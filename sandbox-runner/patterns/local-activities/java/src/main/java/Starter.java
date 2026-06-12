import io.temporal.client.WorkflowClient;
import io.temporal.client.WorkflowOptions;
import io.temporal.serviceclient.WorkflowServiceStubs;

public class Starter {
    public static void main(String[] args) throws Exception {
        WorkflowServiceStubs service = WorkflowServiceStubs.newLocalServiceStubs();
        WorkflowClient client = WorkflowClient.newInstance(service);

        String workflowId = Shared.WORKFLOW_ID_PREFIX + "-" + System.currentTimeMillis();
        WorkflowOptions options = WorkflowOptions.newBuilder()
            .setWorkflowId(workflowId)
            .setTaskQueue(Shared.TASK_QUEUE)
            .build();

        TransactionWorkflow workflow = client.newWorkflowStub(TransactionWorkflow.class, options);

        Shared.TransactionRequest request = new Shared.TransactionRequest(100.0, "USD");
        long t0 = System.currentTimeMillis();
        Shared.Transaction result = workflow.processTransaction(request);
        long elapsed = System.currentTimeMillis() - t0;

        System.out.printf("Transaction complete after %dms: ID=%s Status=%s%n",
            elapsed, result.id(), result.status());
    }
}
