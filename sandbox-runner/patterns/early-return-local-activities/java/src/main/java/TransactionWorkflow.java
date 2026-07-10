import io.temporal.activity.ActivityOptions;
import io.temporal.activity.LocalActivityOptions;
import io.temporal.workflow.UpdateMethod;
import io.temporal.workflow.Workflow;
import io.temporal.workflow.WorkflowInterface;
import io.temporal.workflow.WorkflowMethod;

import java.time.Duration;

@WorkflowInterface
public interface TransactionWorkflow {
    @WorkflowMethod
    Shared.Transaction processTransaction(Shared.TransactionRequest req);

    @UpdateMethod
    Shared.Transaction returnInitResult();

    final class Impl implements TransactionWorkflow {
        // Phase 1: local activities — fast, in-process, no server round-trips.
        private final Activities localActivities = Workflow.newLocalActivityStub(
                Activities.class,
                LocalActivityOptions.newBuilder()
                        .setScheduleToCloseTimeout(Duration.ofSeconds(10))
                        .build());

        // Phase 2: regular activity — may be slow / remote.
        private final Activities activities = Workflow.newActivityStub(
                Activities.class,
                ActivityOptions.newBuilder()
                        .setStartToCloseTimeout(Duration.ofSeconds(30))
                        .build());

        private boolean initDone = false;
        private Shared.Transaction tx;
        private RuntimeException initError;

        @Override
        public Shared.Transaction processTransaction(Shared.TransactionRequest req) {
            // Phase 1: validate + reserve as local activities.
            try {
                this.tx = localActivities.validateTransaction(req);
                this.tx = localActivities.reserveFunds(this.tx);
            } catch (RuntimeException e) {
                this.initError = e;
            } finally {
                this.initDone = true;
            }

            // Phase 2: slow background settlement — regular activity.
            if (initError != null) {
                activities.cancelTransaction(tx);
                return null;
            }

            this.tx = activities.settleTransaction(tx);
            return tx;
        }

        @Override
        public Shared.Transaction returnInitResult() {
            // Block until Phase 1 local activities complete.
            Workflow.await(() -> initDone);
            if (initError != null) {
                throw Workflow.wrap(initError);
            }
            return tx;
        }
    }
}
