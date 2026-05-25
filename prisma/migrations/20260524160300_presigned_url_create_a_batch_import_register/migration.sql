/*
  Warnings:

  - You are about to drop the column `cnpjCount` on the `CnpjBatchImport` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CnpjBatchImport" DROP COLUMN "cnpjCount",
ADD COLUMN     "totalCnpjCount" INTEGER DEFAULT 0;
