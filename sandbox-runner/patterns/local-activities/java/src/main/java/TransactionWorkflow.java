import io.temporal.activity.LocalActivityOptions;
import io.temporal.workflow.Workflow;
import io.temporal.workflow.WorkflowInterface;
import io.temporal.workflow.WorkflowMethod;

import java.time.Duration;

@WorkflowInterface
public interface TransactionWorkflow {
    @WorkflowMethod
    Shared.Transaction processTransaction(Shared.TransactionRequest request);

    class Impl implements TransactionWorkflow {
        // All three activities run as local activities — no server round-trips,
        // no extra WFT scheduling latency between phases.
        private final Activities activities = Workflow.newLocalActivityStub(
            Activities.class,
            LocalActivityOptions.newBuilder()
                .setScheduleToCloseTimeout(Duration.ofSeconds(10))
                .build()
        );

        @Override
        public Shared.Transaction processTransaction(Shared.TransactionRequest request) {
            Shared.Transaction tx = activities.validateTransaction(request);
            tx = activities.reserveFunds(tx);
            tx = activities.settleTransaction(tx);
            return tx;
        }
    }
}
