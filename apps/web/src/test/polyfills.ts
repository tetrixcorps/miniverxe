import { TextEncoder, TextDecoder } from 'util';

// Polyfill for TextEncoder/TextDecoder
(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

// Polyfill for crypto.getRandomValues
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr: any) => {
      return require('crypto').randomBytes(arr.length);
    },
  },
});