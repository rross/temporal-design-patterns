public class Shared {
    public static final String TASK_QUEUE = "eager-workflow-start-task-queue";
    public static final String WORKFLOW_ID_PREFIX = "transaction";

    public record TransactionRequest(double amount, String currency) {}

    public record Transaction(String id, String status) {}
}
