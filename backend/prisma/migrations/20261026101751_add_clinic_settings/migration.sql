-- CreateTable
CREATE TABLE "clinic_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "addressLine" TEXT,
    "postalCode" TEXT,
    "city" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_settings_pkey" PRIMARY KEY ("id")
);
