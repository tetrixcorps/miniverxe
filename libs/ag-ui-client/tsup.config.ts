import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  outDir: 'dist',
  clean: true,
  external: [
    '@ag-ui/core',
    '@ag-ui/proto',
    'rxjs',
    'rxjs/operators',
    'fast-json-patch',
    'untruncate-json',
    'uuid'
  ],
  outExtension({ format }) {
    return format === 'esm' ? { js: '.mjs' } : { js: '.cjs' };
  }
}); 