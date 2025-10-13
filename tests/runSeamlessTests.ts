#!/usr/bin/env ts-node

/**
 * Test runner for Seamless PWA Transition tests
 * Runs unit, functional, and integration tests
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';

const testTypes = ['unit', 'functional', 'integration'];
const testDir = resolve(__dirname);

console.log('🚀 Running Seamless PWA Transition Tests...\n');

// Check if vitest is available
try {
  execSync('npx vitest --version', { stdio: 'pipe' });
} catch (error) {
  console.error('❌ Vitest not found. Please install it first:');
  console.error('npm install -D vitest @vitest/ui jsdom');
  process.exit(1);
}

// Run tests by type
for (const testType of testTypes) {
  const testPath = resolve(testDir, testType);
  
  if (!existsSync(testPath)) {
    console.log(`⚠️  ${testType} test directory not found: ${testPath}`);
    continue;
  }

  console.log(`\n📋 Running ${testType} tests...`);
  console.log('=' .repeat(50));

  try {
    const command = `npx vitest run ${testPath} --reporter=verbose`;
    execSync(command, { 
      stdio: 'inherit',
      cwd: resolve(__dirname, '..')
    });
    console.log(`✅ ${testType} tests completed successfully\n`);
  } catch (error) {
    console.error(`❌ ${testType} tests failed`);
    console.error(error);
    process.exit(1);
  }
}

// Run all tests together
console.log('\n🎯 Running all tests together...');
console.log('=' .repeat(50));

try {
  const command = 'npx vitest run tests/ --reporter=verbose';
  execSync(command, { 
    stdio: 'inherit',
    cwd: resolve(__dirname, '..')
  });
  console.log('\n🎉 All tests completed successfully!');
} catch (error) {
  console.error('\n❌ Some tests failed');
  console.error(error);
  process.exit(1);
}

console.log('\n📊 Test Summary:');
console.log('- Unit Tests: SeamlessTransition component, Header buttons');
console.log('- Functional Tests: PWA Service Worker, Dashboard page');
console.log('- Integration Tests: Complete seamless transition flow');
console.log('\n✨ Seamless PWA Transition implementation is fully tested!');
