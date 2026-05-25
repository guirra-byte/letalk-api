import { S3Client } from '@aws-sdk/client-s3';

export const s3 = new S3Client({
  endpoint: process.env.AWS_S3_ENDPOINT ?? "",
  region: process.env.AWS_S3_REGION ?? "",
  forcePathStyle: Boolean(process.env.AWS_S3_FORCE_PATH_STYLE ?? false),
});