import path from 'node:path';
import { existsSync } from 'node:fs';
import { Worker } from 'node:worker_threads';

interface BatchImportWorker {
  dispatch: (batchImportId: string) => Promise<void>;
}

function resolveWorkerScriptPath(): string {
  const builtWorkerPath = path.join(
    process.cwd(),
    'build/modules/cnpj/services/cnpj-batch-import-worker/worker.js'
  );

  if (existsSync(builtWorkerPath)) {
    return builtWorkerPath;
  }

  throw new Error(
    `Batch import worker not found at ${builtWorkerPath}. Run "npm run build" first.`
  );
}

export default function makeBatchImportWorker(): BatchImportWorker {
  const workerFilepath = resolveWorkerScriptPath();
  const worker = new Worker(workerFilepath);

  worker.on('message', (message) => {
    console.log('[BatchImportWorker] Batch import worker message:', message);
  });

  worker.on('error', (error) => {
    console.error('[BatchImportWorker] Batch import worker error:', error);
  });

  worker.on('exit', (code) => {
    console.log('[BatchImportWorker] Batch import worker exited with code:', code);
  });

  return {
    dispatch: async (batchImportId: string): Promise<void> => {
      worker.postMessage(JSON.stringify({ batchImportId }));
    },
  };
}
