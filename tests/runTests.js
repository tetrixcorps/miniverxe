#!/usr/bin/env node

/**
 * Simple test runner for Seamless PWA Transition tests
 * Runs tests without PostCSS configuration issues
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Running Seamless PWA Transition Tests...\n');

// Test files to run
const testFiles = [
  'tests/unit/seamlessTransition.test.ts',
  'tests/unit/headerAuthButtons.test.ts',
  'tests/functional/pwaServiceWorker.test.ts',
  'tests/functional/dashboard.test.ts',
  'tests/integration/seamlessTransitionFlow.test.ts'
];

let passedTests = 0;
let failedTests = 0;

console.log('📋 Test Files Found:');
testFiles.forEach(file => {
  console.log(`  - ${file}`);
});
console.log('');

// Run each test file individually
for (const testFile of testFiles) {
  console.log(`\n🧪 Running ${testFile}...`);
  console.log('=' .repeat(60));

  try {
    // Use a simple vitest command without config
    const command = `npx vitest run ${testFile} --reporter=verbose --no-config`;
    execSync(command, { 
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..')
    });
    console.log(`✅ ${testFile} passed`);
    passedTests++;
  } catch (error) {
    console.error(`❌ ${testFile} failed`);
    failedTests++;
  }
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Test Summary:');
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(`📁 Total: ${testFiles.length}`);

if (failedTests === 0) {
  console.log('\n🎉 All tests passed successfully!');
  console.log('\n✨ Seamless PWA Transition implementation is fully tested!');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Please check the output above.');
  process.exit(1);
}
