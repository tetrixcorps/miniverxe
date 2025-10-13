/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly MAILGUN_API_KEY: string;
  readonly MAILGUN_DOMAIN: string;
  readonly MAILGUN_WEBHOOK: string;
  readonly MAILGUN_WEBHOOK_SIGNING_KEY: string;
  readonly CONTACT_EMAIL: string;
  readonly FROM_EMAIL: string;
  readonly NODE_ENV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
