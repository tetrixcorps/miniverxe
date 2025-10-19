// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';
// Note: loadEnv is not available in this context, using process.env directly

// Load environment variables from process.env
const env = process.env;

// Get allowed hosts from environment variables
const allowedHosts = process.env.ALLOWED_DOMAINS ? process.env.ALLOWED_DOMAINS.split(',') : [];

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  define: {
    // Make environment variables available to the client
    'import.meta.env.MAILGUN_API_KEY': JSON.stringify(env.MAILGUN_API_KEY),
    'import.meta.env.MAILGUN_DOMAIN': JSON.stringify(env.MAILGUN_DOMAIN),
    'import.meta.env.MAILGUN_WEBHOOK': JSON.stringify(env.MAILGUN_WEBHOOK),
    'import.meta.env.MAILGUN_WEBHOOK_SIGNING_KEY': JSON.stringify(env.MAILGUN_WEBHOOK_SIGNING_KEY),
    // SinchChatLive environment variables
    'import.meta.env.SINCH_PROJECT_ID': JSON.stringify(env.SINCH_PROJECT_ID),
    'import.meta.env.SINCH_APP_ID': JSON.stringify(env.SINCH_APP_ID),
    'import.meta.env.SINCH_CLIENT_ID': JSON.stringify(env.SINCH_CLIENT_ID),
    'import.meta.env.SINCH_CLIENT_SECRET': JSON.stringify(env.SINCH_CLIENT_SECRET),
    'import.meta.env.SINCH_VIRTUAL_NUMBER': JSON.stringify(env.SINCH_VIRTUAL_NUMBER),
    'import.meta.env.NEXT_PUBLIC_SINCH_API_KEY': JSON.stringify(env.NEXT_PUBLIC_SINCH_API_KEY),
    'import.meta.env.NEXT_PUBLIC_SINCH_WIDGET_ID': JSON.stringify(env.NEXT_PUBLIC_SINCH_WIDGET_ID),
  },
  vite: {
    build: {
      rollupOptions: {
        external: [
          // Server-side dependencies that should not be bundled
          'mailgun-js',
          'dotenv',
          'firebase-admin',
          'stripe',
          'axios',
          'node-fetch',
          'form-data'
        ]
      }
    },
    ssr: {
      // Exclude these packages from SSR bundling
      noExternal: []
    }
  },
  server: {
    host: '0.0.0.0', // **CRITICAL: Listen on all network interfaces**
    port: parseInt(process.env.PORT) || 8080,
    // **CRITICAL: Explicitly allow requests from your domains**
    allowedHosts: [
      'goldfish-app-yulr9.ondigitalocean.app', // DigitalOcean's default domain
      'tetrixcorp.com', // TETRIX main domain
      'joromi.ai', // JoRoMi domain
      'api.tetrixcorp.com', // API subdomain
      'iot.tetrixcorp.com', // IoT subdomain
      'vpn.tetrixcorp.com', // VPN subdomain
      ...allowedHosts // Your custom domains from env vars
    ]
  },
  // You can add the same config for preview if you use it
  preview: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT) || 8080,
    allowedHosts: [
      'goldfish-app-yulr9.ondigitalocean.app',
      'tetrixcorp.com', // TETRIX main domain
      'joromi.ai', // JoRoMi domain
      'api.tetrixcorp.com', // API subdomain
      'iot.tetrixcorp.com', // IoT subdomain
      'vpn.tetrixcorp.com', // VPN subdomain
      ...allowedHosts
    ]
  }
});
