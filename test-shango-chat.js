#!/usr/bin/env node
/**
 * SHANGO Chat Test Runner
 * Run this script to test the SHANGO chat functionality on the contact page
 */

import { SHANGOChatTests } from './src/tests/shango-chat-test.js';

async function main() {
  console.log('🚀 Starting SHANGO Chat Test Suite');
  console.log('=====================================\n');
  
  // Check if server is running
  try {
    const response = await fetch('http://localhost:8080/contact');
    if (!response.ok) {
      throw new Error(`Server not responding: ${response.status}`);
    }
    console.log('✅ Server is running on localhost:8080\n');
  } catch (error) {
    console.error('❌ Server is not running or not accessible');
    console.error('Please start the development server with: npm run dev');
    console.error('Then run this test again.\n');
    process.exit(1);
  }

  // Run tests
  const tests = new SHANGOChatTests();
  await tests.runAllTests();
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the tests
main().catch(console.error);
