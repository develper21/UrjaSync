import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up Playwright global configuration...');
  
  // Add polyfills for Node.js environment
  if (typeof globalThis.TextEncoder === 'undefined') {
    const { TextEncoder, TextDecoder } = require('util');
    globalThis.TextEncoder = TextEncoder;
    globalThis.TextDecoder = TextDecoder;
  }

  // Add TransformStream polyfill if needed
  if (typeof globalThis.TransformStream === 'undefined') {
    console.log('Adding TransformStream polyfill...');
    // Use a simple polyfill that avoids type conflicts
    (globalThis as any).TransformStream = class {
      constructor(transformer = {}, writableStrategy = {}, readableStrategy = {}) {
        // Store configuration privately using dynamic properties
        (this as any)._transformer = transformer;
        (this as any)._writableStrategy = writableStrategy;
        (this as any)._readableStrategy = readableStrategy;
      }
      
      get readable() {
        return {
          getReader: () => ({
            read: async () => ({ value: null, done: true }),
            releaseLock: () => {},
          }),
        };
      }
      
      get writable() {
        return {
          getWriter: () => ({
            write: async () => {},
            close: async () => {},
            releaseLock: () => {},
          }),
        };
      }
    };
  }

  console.log('✅ Playwright global setup complete');
}

export default globalSetup;
