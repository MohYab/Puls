-- CreateTable
CREATE TABLE "appointment_status_changes" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "fromStatus" "AppointmentStatus" NOT NULL,
    "toStatus" "AppointmentStatus" NOT NULL,
    "changedByUserId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointment_status_changes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "appointment_status_changes_appointmentId_createdAt_idx" ON "appointment_status_changes"("appointmentId", "createdAt");

-- AddForeignKey
ALTER TABLE "appointment_status_changes" ADD CONSTRAINT "appointment_status_changes_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_status_changes" ADD CONSTRAINT "appointment_status_changes_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
