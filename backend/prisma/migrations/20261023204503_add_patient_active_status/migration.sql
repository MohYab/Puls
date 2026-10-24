-- CreateEnum
CREATE TYPE "PatientDeactivationReason" AS ENUM ('DECEASED', 'MOVED', 'OTHER');

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "deactivatedAt" TIMESTAMP(3),
ADD COLUMN     "deactivationReason" "PatientDeactivationReason",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
