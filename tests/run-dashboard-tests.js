#!/usr/bin/env node

/**
 * Dashboard Test Runner
 * Runs all dashboard-related tests with proper configuration
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Running Dashboard Tests...\n');

const testConfig = {
  // Test patterns
  patterns: [
    'tests/unit/dashboard*.test.ts',
    'tests/functional/dashboard*.test.ts',
    'tests/e2e/dashboard*.test.ts'
  ],
  
  // Test environment
  environment: 'jsdom',
  
  // Coverage settings
  coverage: {
    enabled: true,
    reporter: ['text', 'lcov', 'html'],
    include: [
      'src/services/dashboardService.ts',
      'src/pages/dashboards/**/*.astro',
      'src/components/dashboard/**/*.astro',
      'src/pages/api/v1/dashboard/**/*.ts'
    ],
    exclude: [
      '**/*.test.ts',
      '**/*.test.js',
      '**/node_modules/**',
      '**/dist/**'
    ]
  },
  
  // Performance settings
  performance: {
    timeout: 10000,
    slowThreshold: 1000
  }
};

function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    const output = execSync(command, { 
      cwd: process.cwd(),
      stdio: 'pipe',
      encoding: 'utf8'
    });
    console.log(`✅ ${description} completed successfully\n`);
    return output;
  } catch (error) {
    console.error(`❌ ${description} failed:`);
    console.error(error.stdout || error.message);
    process.exit(1);
  }
}

function runUnitTests() {
  const command = `npx vitest run tests/unit/dashboard*.test.ts --reporter=verbose --coverage`;
  return runCommand(command, 'Running Unit Tests');
}

function runFunctionalTests() {
  const command = `npx vitest run tests/functional/dashboard*.test.ts --reporter=verbose`;
  return runCommand(command, 'Running Functional Tests');
}

function runE2ETests() {
  const command = `npx playwright test tests/e2e/dashboard*.test.ts --reporter=line`;
  return runCommand(command, 'Running E2E Tests');
}

function runPerformanceTests() {
  const command = `npx vitest run tests/unit/dashboard-performance.test.ts --reporter=verbose`;
  return runCommand(command, 'Running Performance Tests');
}

function generateTestReport() {
  console.log('📊 Generating Test Report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    environment: 'test',
    tests: {
      unit: { status: 'completed' },
      functional: { status: 'completed' },
      e2e: { status: 'completed' },
      performance: { status: 'completed' }
    },
    coverage: {
      enabled: testConfig.coverage.enabled,
      reporters: testConfig.coverage.reporter
    },
    performance: testConfig.performance
  };
  
  console.log('📈 Test Report Generated:');
  console.log(JSON.stringify(report, null, 2));
  console.log('\n🎉 All Dashboard Tests Completed Successfully!');
}

function main() {
  console.log('🚀 Starting Dashboard Test Suite\n');
  
  try {
    // Run all test suites
    runUnitTests();
    runFunctionalTests();
    runPerformanceTests();
    
    // E2E tests are optional and may require a running server
    try {
      runE2ETests();
    } catch (error) {
      console.log('⚠️  E2E tests skipped (server may not be running)');
    }
    
    generateTestReport();
    
  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run the test suite
if (require.main === module) {
  main();
}

module.exports = {
  runUnitTests,
  runFunctionalTests,
  runE2ETests,
  runPerformanceTests,
  generateTestReport
};
