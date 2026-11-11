-- CreateEnum
CREATE TYPE "TimezoneBehavior" AS ENUM ('FIXED', 'FLOATING');

-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('SYSTEM', 'LIGHT', 'DARK');

-- CreateTable
CREATE TABLE "user_settings" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "locale" TEXT NOT NULL DEFAULT 'en',
    "default_reminder_minutes" INTEGER NOT NULL DEFAULT 10,
    "default_event_duration_minutes" INTEGER NOT NULL DEFAULT 30,
    "timezone_behavior" "TimezoneBehavior" NOT NULL DEFAULT 'FIXED',
    "critical_reminders_enabled" BOOLEAN NOT NULL DEFAULT false,
    "theme" "Theme" NOT NULL DEFAULT 'SYSTEM',
    "notification_sound" TEXT NOT NULL DEFAULT 'default',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_user_id_key" ON "user_settings"("user_id");

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Backfill: existing users get the default settings, so every user has a row
INSERT INTO "user_settings" ("id", "user_id", "updated_at")
SELECT gen_random_uuid(), "id", CURRENT_TIMESTAMP FROM "users";
