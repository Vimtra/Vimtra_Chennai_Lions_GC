-- Media coverage: OFFICIAL kind (M7, step 1 of 2).
--
-- Official league / franchise reporting and third-party press have shared
-- the MediaCoverage table since M4, told apart only by the source host at
-- render time. That classification now lives in the data: a third kind,
-- OFFICIAL, that the admin sets explicitly and the public page reads.
--
-- This migration ONLY adds the enum value. PostgreSQL will not let a value
-- added by ALTER TYPE ... ADD VALUE be used inside the same transaction
-- that added it, and Prisma runs each migration file in one transaction —
-- so the backfill that uses OFFICIAL is the next migration, not this one.

-- AlterEnum
ALTER TYPE "MediaKind" ADD VALUE 'OFFICIAL';
