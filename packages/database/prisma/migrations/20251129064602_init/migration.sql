-- CreateTable
CREATE TABLE "PatientRegistry" (
    "id" TEXT NOT NULL,
    "abhaId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientRegistry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PatientRegistry_abhaId_key" ON "PatientRegistry"("abhaId");

-- AddForeignKey
ALTER TABLE "PatientRegistry" ADD CONSTRAINT "PatientRegistry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
