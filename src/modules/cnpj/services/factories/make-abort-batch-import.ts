import { CancelImport } from "../use-cases/abort-batch-import";
import { prismaClient } from ".";

export function makeAbortBatchImport() {
  return new CancelImport(prismaClient);
}
