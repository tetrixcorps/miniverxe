// src/lib/getViteEnv.ts
// @ts-ignore
export function getViteApiBaseUrl() {
  // @ts-ignore
  return import.meta.env?.VITE_API_URL;
} 