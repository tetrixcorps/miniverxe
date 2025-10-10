// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  server: {
    host: true,
    port: 4321,
    allowedHosts: [
      'tetrix-unified-app-keg3z.ondigitalocean.app',
      'localhost',
      '127.0.0.1'
    ]
  }
});
