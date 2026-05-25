import csv from "csv-parser";
import { CnpjLookup, type CnpjLookupResponse } from "./cnpj-lookup";
import {
  PipelineStatus,
  Priority,
  type PrismaClient,
} from "../../../../../generated/prisma/client";
import type AwsS3Provider from "@/core/providers/aws-s3/aws-s3-provider";
import { invalidateLeadsCache } from "@/core/handlers/cache/leads-cache";
import { BatchImportNotFoundError } from "@/modules/cnpj/errors/errors";
import { buildCompanyProfileCreateInput } from "../build-company-profile-create-input";

interface BatchImportRequest {
  batchImportId: string;
}

interface ParsedCsvRow {
  leadName: string;
  leadEmail: string;
  leadPhoneNumber: string;
  companyName: string;
  cnpj: string;
}

const CSV_HEADERS = {
  nome: "leadName",
  email: "leadEmail",
  telefone: "leadPhoneNumber",
  empresa: "companyName",
  cnpj: "cnpj",
} as const satisfies Record<string, keyof ParsedCsvRow>;

function mapCsvHeader(header: string): keyof ParsedCsvRow {
  const normalized = header.trim().toLowerCase();
  const mapped = CSV_HEADERS[normalized as keyof typeof CSV_HEADERS];

  if (!mapped) {
    throw new Error(
      `Invalid CSV header "${header.trim()}". Expected exactly: nome;email;telefone;empresa;cnpj`
    );
  }

  return mapped;
}

export class BatchImport {
  private readonly BATCH_SIZE: number = 50;

  constructor(
    private readonly cnpjLookupService: CnpjLookup,
    private readonly prismaClient: PrismaClient,
    private readonly awsS3Provider: AwsS3Provider
  ) {}

  async execute(request: BatchImportRequest) {
    console.log("[BatchImportService] Executing batch import", request);
    try {
      const batchImport = await this.prismaClient.cnpjBatchImport.findUnique({
        where: { id: request.batchImportId },
      });

      if (!batchImport) {
        throw new BatchImportNotFoundError(
          "[BatchImport]",
          404,
          `Batch import not found for batch import id: ${request.batchImportId}`
        );
      }

      const readStream = await this.awsS3Provider.downloadFile(batchImport.fileKey);

      const batchSize = this.BATCH_SIZE;
      let batch: ParsedCsvRow[] = [];

      const processCsvDataGen = async function* (): AsyncGenerator<{
        rows: ParsedCsvRow[];
      }> {
        for await (const row of readStream.pipe(
          csv({
            separator: ";",
            mapHeaders: ({ header }: { header: string }) => mapCsvHeader(header),
          })
        )) {
          const parsed = JSON.parse(JSON.stringify(row)) as ParsedCsvRow;
          batch.push(parsed);

          if (batch.length >= batchSize) {
            yield { rows: batch };
            batch = [];
          }
        }

        if (batch.length > 0) {
          yield { rows: batch };
        }
      };

      for await (const { rows } of processCsvDataGen()) {
        console.log(`[BatchImportService] Processing batch ${rows.length} rows`);
        const results = await Promise.allSettled(
          rows.map((row) =>
            this.cnpjLookupService.execute({
              cnpj: row.cnpj,
              leadName: row.leadName,
              leadEmail: row.leadEmail,
              leadPhoneNumber: row.leadPhoneNumber,
              companyName: row.companyName,
            })
          )
        );

        const successfulResults = results.filter(
          (result): result is PromiseFulfilledResult<CnpjLookupResponse> =>
            result.status === "fulfilled"
        );

        console.log(`[BatchImportService] Successful results ${successfulResults.length}`);

        const failedResults = results.filter(
          (result): result is PromiseRejectedResult => result.status === "rejected"
        );

        console.log(`[BatchImportService] Failed results ${failedResults.length}`);

        const leads = successfulResults.map((result) => result.value);
        await this.storeLeads(leads);

        const cnpjBatchImport = await this.prismaClient.cnpjBatchImport.findUnique({
          where: { id: batchImport.id },
        });

        if (!cnpjBatchImport) {
          throw new BatchImportNotFoundError(
            "[BatchImport]",
            404,
            `Batch import not found for batch import id: ${batchImport.id}`
          );
        }

        await this.prismaClient.cnpjBatchImport.update({
          where: { id: cnpjBatchImport.id },
          data: {
            totalCnpjCount: (cnpjBatchImport.totalCnpjCount ?? 0) + results.length,
            processedCnpjCount:
              (cnpjBatchImport.processedCnpjCount ?? 0) + successfulResults.length,
            failedCnpjCount:
              (cnpjBatchImport.failedCnpjCount ?? 0) + failedResults.length,
          },
        });
      }

      await invalidateLeadsCache();
    } catch (error) {
      console.error("[BatchImportWorker] Error processing batch import:", error);
      throw error;
    }
  }

  private async storeLeads(leads: CnpjLookupResponse[]): Promise<void> {
    if (leads.length === 0) return;

    const importedAt = new Date();

    await this.prismaClient.$transaction(
      leads.map((lead) =>
        this.prismaClient.companyProfile.create({
          data: buildCompanyProfileCreateInput(lead, {
            pipelineStatus: PipelineStatus.PENDING,
            priority: Priority.LOW,
            isImported: true,
            importedAt,
          }),
        })
      )
    );
  }
}
