import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  type S3ClientConfig,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Readable } from "node:stream";
import { isHttpEndpoint, normalizeS3Key } from "./utils";
import { normalizeFilename } from "./filename-mapper";
import { mapBatchImportToS3Path } from "./s3-path-mapper";

function createS3ClientConfig(): S3ClientConfig {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();

  const config: S3ClientConfig = {
    region: process.env.AWS_S3_REGION ?? "us-east-1",
    forcePathStyle: process.env.AWS_S3_FORCE_PATH_STYLE === "true",
  };

  if (accessKeyId && secretAccessKey) {
    config.credentials = { accessKeyId, secretAccessKey };
  }

  if (isHttpEndpoint(process.env.AWS_S3_ENDPOINT)) {
    config.endpoint = process.env.AWS_S3_ENDPOINT!.trim();
  }

  return config;
}

export default class AwsS3Provider {
  private readonly bucketName: string = process.env.AWS_S3_BUCKET_NAME ?? "";
  private readonly s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client(createS3ClientConfig());
  }

  public async createPresignedUploadUrl(
    fileName: string,
    mimetype: string
  ): Promise<{ uploadPresignedUrl: string; s3Path: string }> {
    const normalizedFileName = normalizeFilename(fileName);
    const s3Path = mapBatchImportToS3Path(normalizedFileName);
    const putObjectCommand = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: s3Path,
      ContentType: mimetype,
    });

    const uploadPresignedUrl = await getSignedUrl(
      this.s3Client,
      putObjectCommand,
      { expiresIn: 60 * 60 * 24 * 1 } // 1 day
    );

    return { uploadPresignedUrl, s3Path };
  }

  public async listPaths(prefix: string): Promise<string[]> {
    try {
      const params = { Bucket: this.bucketName, Prefix: prefix };
      const command = new ListObjectsV2Command(params);
      const resp = await this.s3Client.send(command);

      return (resp.Contents ?? [])
        .map(
          (obj) =>
            obj.Key!.replace(prefix, "").split("/", 3).slice(0, 3).join("/") +
            "/"
        )
        .filter(Boolean);
    } catch (error) {
      console.error(`Failed to list paths from S3:`, error);
      throw new Error(`Failed to list paths from S3: ${error}`);
    }
  }

  public async downloadFile(s3Key: string): Promise<Readable> {
    const key = normalizeS3Key(s3Key);

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error(`S3 object body is empty for key: ${key}`);
      }

      return response.Body as Readable;
    } catch (error) {
      console.error(`Failed to download file from S3:`, error);
      throw new Error(`Failed to download file from S3: ${error}`);
    }
  }

  public async deleteFile(fileKey: string): Promise<void> {
    try {
      const key = normalizeS3Key(fileKey);
      const params = { Bucket: this.bucketName, Key: key };
      const command = new DeleteObjectCommand(params);
      await this.s3Client.send(command);
    } catch (error) {
      console.error(`Failed to delete file from S3:`, error);
      throw new Error(`Failed to delete file from S3: ${error}`);
    }
  }
}
