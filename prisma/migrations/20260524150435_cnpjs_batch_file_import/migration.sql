-- CreateEnum
CREATE TYPE "CnpjBatchImportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "CompanyProfile" ADD COLUMN     "importedAt" TIMESTAMP(3),
ADD COLUMN     "isImported" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "CompanyProfileBatchImport" (
    "id" TEXT NOT NULL,
    "batchImportId" TEXT NOT NULL,
    "companyProfileId" TEXT NOT NULL,

    CONSTRAINT "CompanyProfileBatchImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CnpjBatchImport" (
    "id" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "cnpjCount" INTEGER NOT NULL,
    "processedCnpjCount" INTEGER DEFAULT 0,
    "failedCnpjCount" INTEGER DEFAULT 0,
    "status" "CnpjBatchImportStatus" NOT NULL DEFAULT 'PENDING',
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CnpjBatchImport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyProfileBatchImport_batchImportId_key" ON "CompanyProfileBatchImport"("batchImportId");

-- CreateIndex
CREATE UNIQUE INDEX "CnpjBatchImport_fileKey_key" ON "CnpjBatchImport"("fileKey");

-- AddForeignKey
ALTER TABLE "CompanyProfileBatchImport" ADD CONSTRAINT "CompanyProfileBatchImport_companyProfileId_fkey" FOREIGN KEY ("companyProfileId") REFERENCES "CompanyProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
