import AwsS3Provider from "@/core/providers/aws-s3/aws-s3-provider";
import { AppError } from "@/core/error/app-error";
import { Prisma } from "../../../../../generated/prisma/client";
import type { PrismaClient } from "../../../../../generated/prisma/client";

interface RequestPresignedUploadUrlRequest {
  fileName: string;
  mimetype: string;
}

export class RequestPresignedUploadUrl {
  constructor(
    private readonly awsS3Provider: AwsS3Provider,
    private readonly prisma: PrismaClient
  ) {}

  async execute(
    request: RequestPresignedUploadUrlRequest
  ): Promise<{ uploadPresignedUrl: string; batchImportId: string }> {
    const { fileName, mimetype } = request;

    try {
      const { uploadPresignedUrl, s3Path } =
        await this.awsS3Provider.createPresignedUploadUrl(fileName, mimetype);

      const batchImport = await this.prisma.cnpjBatchImport.create({
        data: { fileKey: s3Path },
      });

      return { uploadPresignedUrl, batchImportId: batchImport.id };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new AppError(
          "[RequestPresignedUploadUrl]",
          "A batch import for this file is already in progress",
          409
        );
      }

      throw error;
    }
  }
}
