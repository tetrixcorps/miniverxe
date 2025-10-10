// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  server: {
    host: true,
    port: 4321,
    allowedHosts: [
      'tetrix-unified-app-keg3z.ondigitalocean.app',
      'localhost',
      '127.0.0.1'
    ]
  },
  // Add specific configuration for API routes
  experimental: {
    // Enable experimental features that might help with request body parsing
  },
  // Ensure API routes are properly handled
  output: 'server',
  adapter: undefined // Use default adapter for now
});
