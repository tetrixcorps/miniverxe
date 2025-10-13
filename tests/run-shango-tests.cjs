#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Running SHANGO Chat Tests...\n');

const testFiles = [
  'tests/unit/shangoChatAPI.test.ts',
  'tests/unit/shangoChatWidget.test.ts',
  'tests/unit/shangoIntegration.test.ts'
];

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

for (const testFile of testFiles) {
  console.log(`📋 Running ${testFile}...`);
  
  try {
    const result = execSync(`npx vitest run ${testFile} --reporter=verbose`, {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log(`✅ ${testFile} - PASSED`);
    console.log(result);
    
    // Extract test count from output (basic parsing)
    const lines = result.split('\n');
    const testLine = lines.find(line => line.includes('Tests:') || line.includes('test'));
    if (testLine) {
      const match = testLine.match(/(\d+)\s+passed/);
      if (match) {
        passedTests += parseInt(match[1]);
      }
    }
    
  } catch (error) {
    console.log(`❌ ${testFile} - FAILED`);
    console.log(error.stdout || error.message);
    
    // Extract failed test count
    const output = error.stdout || error.message;
    const lines = output.split('\n');
    const failLine = lines.find(line => line.includes('failed') || line.includes('FAIL'));
    if (failLine) {
      const match = failLine.match(/(\d+)\s+failed/);
      if (match) {
        failedTests += parseInt(match[1]);
      }
    }
  }
  
  console.log(''); // Empty line for readability
}

totalTests = passedTests + failedTests;

console.log('📊 Test Summary:');
console.log(`   Total Tests: ${totalTests}`);
console.log(`   Passed: ${passedTests}`);
console.log(`   Failed: ${failedTests}`);
console.log(`   Success Rate: ${totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0}%`);

if (failedTests > 0) {
  console.log('\n❌ Some tests failed. Please check the output above for details.');
  process.exit(1);
} else {
  console.log('\n🎉 All SHANGO Chat tests passed!');
  process.exit(0);
}
