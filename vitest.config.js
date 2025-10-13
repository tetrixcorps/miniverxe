import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    include: [
      'tests/unit/**/*.test.js',
      'tests/unit/**/*.test.ts',
      'tests/functional/**/*.test.js',
      'tests/functional/**/*.test.ts',
      'tests/integration/**/*.test.js',
      'tests/integration/**/*.test.ts'
    ],
    exclude: [
      '**/*.spec.ts',
      '**/*.spec.js',
      '**/e2e/**',
      '**/playwright/**',
      'node_modules/**',
      'dist/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        '**/*.config.js',
        '**/*.test.js',
        '**/*.spec.ts',
        '**/*.spec.js'
      ]
    }
  }
});
