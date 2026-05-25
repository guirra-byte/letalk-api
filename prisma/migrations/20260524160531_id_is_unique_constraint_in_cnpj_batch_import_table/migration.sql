/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `CnpjBatchImport` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CnpjBatchImport_id_key" ON "CnpjBatchImport"("id");
