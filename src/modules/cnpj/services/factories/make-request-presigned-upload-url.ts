import { RequestPresignedUploadUrl } from "../use-cases/request-presigned-upload-url";
import { awsS3Provider, prismaClient } from ".";

export function makeRequestPresignedUploadUrl() {
  return new RequestPresignedUploadUrl(awsS3Provider, prismaClient);
}
