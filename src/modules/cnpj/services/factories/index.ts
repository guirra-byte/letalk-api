import AwsS3Provider from "@/core/providers/aws-s3/aws-s3-provider";
import { RedisCacheProvider } from "@/core/providers/cache/cache-provider";

export { default as prismaClient } from "@/core/libs/prisma/client";

export const awsS3Provider = new AwsS3Provider();
export const cacheProvider = new RedisCacheProvider();
