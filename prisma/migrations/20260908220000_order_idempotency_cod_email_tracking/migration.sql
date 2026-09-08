-- Order idempotency (checkout retries / double-clicks) + Cash on Delivery
-- email delivery tracking. Purely additive: three new nullable columns and
-- one unique index. No existing row's meaning changes, no backfill needed
-- — every pre-existing order simply has NULL in all three, which correctly
-- means "no idempotency key" / "no COD email recorded yet".

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "clientRequestId" TEXT;
ALTER TABLE "Order" ADD COLUMN "codUserEmailSentAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "codAdminEmailSentAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Order_clientRequestId_key" ON "Order"("clientRequestId");
