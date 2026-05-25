import { parentPort } from "worker_threads";
import { BatchImportWorkerUndefinedParentPort } from "../../errors/errors";
import { makeBatchImport } from "../factories/make-batch-import";
import { AppError } from "@/core/error/app-error";

if (!parentPort) {
  throw new BatchImportWorkerUndefinedParentPort("[CnpjBatchImportWorker Start]", 500, "This script is meant to be run as a worker");
}

interface BatchImportRequest {
  batchImportId: string;
}

// This script just works as .js file (transpiled from .ts)
parentPort.on("message", async (incomingData: string) => {
  if (!parentPort) {
    throw new BatchImportWorkerUndefinedParentPort("[CnpjBatchImportWorker On Message]", 500, "Parent port is undefined");
  }

  const data = JSON.parse(incomingData) as BatchImportRequest;
  console.log("[CnpjBatchImportWorker] Received batch import request: ", data.batchImportId);

  try {
    const batchImportService = makeBatchImport();
    await batchImportService.execute(data);

    console.log("[CnpjBatchImportWorker] Batch import completed successfully: ", data.batchImportId);
    parentPort.postMessage(JSON.stringify({ success: true }));
  } catch (error) {
    console.error(`[CnpjBatchImportWorker] Batch import failed: ${data.batchImportId} `, error);
    if (error instanceof AppError) {
      parentPort.postMessage(JSON.stringify({ success: false, error: error.message }));
      parentPort.close();
    }

    parentPort.postMessage(JSON.stringify({ success: false, error: "An unknown error occurred" as string }));
    parentPort.close();
  }
});