-- AlterTable
ALTER TABLE "user_devices" ADD COLUMN     "installation_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_devices_installation_id_key" ON "user_devices"("installation_id");
