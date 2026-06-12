import io.temporal.client.WorkflowClient;
import io.temporal.serviceclient.WorkflowServiceStubs;
import io.temporal.worker.WorkerFactory;

public class Worker {
    public static void main(String[] args) {
        WorkflowServiceStubs service = WorkflowServiceStubs.newLocalServiceStubs();
        WorkflowClient client = WorkflowClient.newInstance(service);
        WorkerFactory factory = WorkerFactory.newInstance(client);

        io.temporal.worker.Worker worker = factory.newWorker(Shared.TASK_QUEUE);
        worker.registerWorkflowImplementationTypes(TransactionWorkflow.Impl.class);
        worker.registerActivitiesImplementations(new Activities.Impl());

        System.out.println("Worker started on task queue: " + Shared.TASK_QUEUE);
        factory.start();
    }
}
