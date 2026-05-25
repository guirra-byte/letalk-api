/*
  Warnings:

  - The values [PROSPECTING,CONTACTED] on the enum `PipelineStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PipelineStatus_new" AS ENUM ('PENDING', 'IN_REVIEW', 'QUALIFIED', 'REJECTED');
ALTER TABLE "public"."CompanyProfile" ALTER COLUMN "pipelineStatus" DROP DEFAULT;
ALTER TABLE "CompanyProfile" ALTER COLUMN "pipelineStatus" TYPE "PipelineStatus_new" USING ("pipelineStatus"::text::"PipelineStatus_new");
ALTER TYPE "PipelineStatus" RENAME TO "PipelineStatus_old";
ALTER TYPE "PipelineStatus_new" RENAME TO "PipelineStatus";
DROP TYPE "public"."PipelineStatus_old";
ALTER TABLE "CompanyProfile" ALTER COLUMN "pipelineStatus" SET DEFAULT 'PENDING';
COMMIT;
