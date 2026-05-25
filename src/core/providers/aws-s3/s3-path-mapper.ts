import { randomUUID } from "node:crypto";
import { normalizeFilename } from "./filename-mapper";
import { joinPathSegments } from "./utils";

const BATCH_IMPORT_PREFIX = "batch-imports";

export function mapBatchImportToS3Path(fileName: string): string {
  return joinPathSegments(
    BATCH_IMPORT_PREFIX,
    randomUUID(),
    normalizeFilename(fileName)
  );
}
