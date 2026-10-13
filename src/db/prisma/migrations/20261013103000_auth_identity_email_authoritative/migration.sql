-- AlterTable
ALTER TABLE "auth_identities" ADD COLUMN     "email_authoritative" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: Apple addresses and Gmail addresses are owned by their provider. Workspace (hd) can't be
-- recovered from stored data, so those stay false until the user signs in again.
UPDATE "auth_identities"
SET "email_authoritative" = true
WHERE "provider" = 'apple'
   OR lower("email_at_provider") LIKE '%@gmail.com'
   OR lower("email_at_provider") LIKE '%@googlemail.com';
