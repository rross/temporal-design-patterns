import io.temporal.activity.ActivityInterface;
import io.temporal.activity.ActivityMethod;

@ActivityInterface
public interface Activities {
    @ActivityMethod
    Shared.Transaction validateTransaction(Shared.TransactionRequest request);

    @ActivityMethod
    Shared.Transaction reserveFunds(Shared.Transaction transaction);

    @ActivityMethod
    Shared.Transaction settleTransaction(Shared.Transaction transaction);

    @ActivityMethod
    void cancelTransaction(Shared.Transaction transaction);

    class Impl implements Activities {
        @Override
        public Shared.Transaction validateTransaction(Shared.TransactionRequest request) {
            if (request.amount() <= 0) {
                throw new IllegalArgumentException("Invalid transaction amount: " + request.amount());
            }
            String id = "tx-" + System.currentTimeMillis();
            return new Shared.Transaction(id, "initialized");
        }

        @Override
        public Shared.Transaction reserveFunds(Shared.Transaction transaction) {
            return new Shared.Transaction(transaction.id(), "reserved");
        }

        @Override
        public Shared.Transaction settleTransaction(Shared.Transaction transaction) {
            // Simulate slow background settlement so the early-return effect is visible.
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            return new Shared.Transaction(transaction.id(), "completed");
        }

        @Override
        public void cancelTransaction(Shared.Transaction transaction) {
            String id = transaction != null ? transaction.id() : "(uninitialized)";
            System.out.println("Cancelled transaction " + id);
        }
    }
}
