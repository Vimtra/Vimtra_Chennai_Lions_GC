-- Add persistent tracking for the customer cancellation email.
ALTER TABLE "Order"
ADD COLUMN "cancellationEmailSentAt" TIMESTAMP(3);
