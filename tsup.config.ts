import { defineConfig } from 'tsup';

const importMetaUrlShim = `
const { pathToFileURL } = require('node:url');
const __importMetaUrl = pathToFileURL(__filename).href;
`;

export default defineConfig({
  entry: {
    server: 'src/server.ts',
    'modules/cnpj/services/cnpj-batch-import-worker/worker':
      'src/modules/cnpj/services/cnpj-batch-import-worker/worker.ts',
  },
  format: ['cjs'],
  outDir: 'build',
  clean: true,
  dts: false,
  sourcemap: true,
  esbuildOptions(options) {
    options.banner = {
      js: importMetaUrlShim,
    };
    options.define = {
      ...(options.define ?? {}),
      'import.meta.url': '__importMetaUrl',
    };
  },
});
