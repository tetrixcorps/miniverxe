// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

// Get allowed hosts from environment variables
const allowedHosts = process.env.ALLOWED_DOMAINS ? process.env.ALLOWED_DOMAINS.split(',') : [];

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  server: {
    host: '0.0.0.0', // **CRITICAL: Listen on all network interfaces**
    port: process.env.PORT || 8080,
    // **CRITICAL: Explicitly allow requests from your domains**
    allowedHosts: [
      'goldfish-app-yulr9.ondigitalocean.app', // DigitalOcean's default domain
      ...allowedHosts // Your custom domains from env vars
    ]
  },
  // You can add the same config for preview if you use it
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT || 8080,
    allowedHosts: [
      'goldfish-app-yulr9.ondigitalocean.app',
      ...allowedHosts
    ]
  }
});
