-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "PipelineStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'PROSPECTING', 'CONTACTED', 'QUALIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CnaeType" AS ENUM ('PRIMARY', 'SECONDARY');

-- CreateTable
CREATE TABLE "CompanyProfile" (
    "id" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "pipelineStatus" "PipelineStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "legalName" TEXT NOT NULL,
    "tradeName" TEXT,
    "email" TEXT,
    "capitalSocial" INTEGER NOT NULL,
    "foundedAt" TIMESTAMP(3) NOT NULL,
    "primaryActivity" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "cnpjOrCpf" TEXT NOT NULL,
    "ageRange" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL,
    "companyProfileId" TEXT NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cnae" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "CnaeType" NOT NULL,
    "companyProfileId" TEXT NOT NULL,

    CONSTRAINT "Cnae_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxRegime" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "taxationType" TEXT NOT NULL,
    "companyProfileId" TEXT NOT NULL,

    CONSTRAINT "TaxRegime_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyProfile_cnpj_key" ON "CompanyProfile"("cnpj");

-- AddForeignKey
ALTER TABLE "Partner" ADD CONSTRAINT "Partner_companyProfileId_fkey" FOREIGN KEY ("companyProfileId") REFERENCES "CompanyProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cnae" ADD CONSTRAINT "Cnae_companyProfileId_fkey" FOREIGN KEY ("companyProfileId") REFERENCES "CompanyProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxRegime" ADD CONSTRAINT "TaxRegime_companyProfileId_fkey" FOREIGN KEY ("companyProfileId") REFERENCES "CompanyProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
