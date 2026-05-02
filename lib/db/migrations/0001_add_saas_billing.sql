ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "plan" varchar NOT NULL DEFAULT 'free';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "billingStatus" varchar NOT NULL DEFAULT 'inactive';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "billingCustomerId" text;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "billingSubscriptionId" text;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "billingPeriodEnd" timestamp;
