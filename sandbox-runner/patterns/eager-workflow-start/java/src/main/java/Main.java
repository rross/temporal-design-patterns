import io.temporal.client.WorkflowClient;
import io.temporal.client.WorkflowOptions;
import io.temporal.serviceclient.WorkflowServiceStubs;
import io.temporal.worker.WorkerFactory;

/**
 * Eager Workflow Start demo: worker and starter run in the same process.
 *
 * <p>The WorkerFactory is started before the workflow is executed so the server
 * can eagerly dispatch the first workflow task directly to this process —
 * bypassing the Matching Service queue and removing one server round-trip.
 */
public class Main {
    public static void main(String[] args) throws Exception {
        WorkflowServiceStubs service = WorkflowServiceStubs.newLocalServiceStubs();
        WorkflowClient client = WorkflowClient.newInstance(service);

        // Start the worker in the same JVM so it is registered before we call
        // ExecuteWorkflow.
        WorkerFactory factory = WorkerFactory.newInstance(client);
        io.temporal.worker.Worker worker = factory.newWorker(Shared.TASK_QUEUE);
        worker.registerWorkflowImplementationTypes(TransactionWorkflow.Impl.class);
        worker.registerActivitiesImplementations(new Activities.Impl());
        factory.start();

        System.out.println("Worker started on task queue: " + Shared.TASK_QUEUE);

        String workflowId = Shared.WORKFLOW_ID_PREFIX + "-" + System.currentTimeMillis();
        Shared.TransactionRequest req = new Shared.TransactionRequest(100.0, "USD");

        // setDisableEagerExecution(false) opts in to Eager Workflow Start so the
        // server dispatches the first WFT directly to this co-located worker.
        WorkflowOptions options = WorkflowOptions.newBuilder()
            .setWorkflowId(workflowId)
            .setTaskQueue(Shared.TASK_QUEUE)
            .setDisableEagerExecution(false)
            .build();

        TransactionWorkflow workflow = client.newWorkflowStub(TransactionWorkflow.class, options);

        long t0 = System.currentTimeMillis();
        Shared.Transaction result = workflow.processTransaction(req);
        long elapsed = System.currentTimeMillis() - t0;

        System.out.printf("Transaction complete after %dms: ID=%s Status=%s%n",
            elapsed, result.id(), result.status());

        System.exit(0);
    }
}
