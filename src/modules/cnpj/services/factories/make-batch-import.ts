import { BatchImport } from "../use-cases/batch-import";
import { makeCnpjLookup } from "./make-cnpj-lookup";
import { awsS3Provider, prismaClient } from ".";

export function makeBatchImport() {
  const cnpjLookupService = makeCnpjLookup();
  return new BatchImport(cnpjLookupService, prismaClient, awsS3Provider);
}
