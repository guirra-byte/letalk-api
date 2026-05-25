import { BatchImportNotFoundError } from "@/modules/cnpj/errors/errors";
import { type PrismaClient } from "../../../../../generated/prisma/client";

interface CancelImportRequest {
  batchImportId: string;
}

export class CancelImport {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(request: CancelImportRequest): Promise<void> {
    const { batchImportId } = request;
    const batchImport = await this.prisma.cnpjBatchImport.findUnique({
      where: { id: batchImportId },
    });

    if (!batchImport) {
      throw new BatchImportNotFoundError(
        "[CancelImportService]",
        404,
        `Batch import not found for batch import id: ${batchImportId}`
      );
    }

    await this.prisma.cnpjBatchImport.delete({
      where: { id: batchImport.id },
    });
  }
}