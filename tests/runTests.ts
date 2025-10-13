#!/usr/bin/env ts-node
// Test runner for TETRIX dual invoice delivery tests

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

interface TestSuite {
  name: string;
  path: string;
  description: string;
}

const TEST_SUITES: TestSuite[] = [
  {
    name: 'Unit Tests',
    path: 'tests/unit',
    description: 'Individual service and component tests'
  },
  {
    name: 'Functional Tests',
    path: 'tests/functional',
    description: 'End-to-end workflow tests'
  },
  {
    name: 'Integration Tests',
    path: 'tests/integration',
    description: 'Full system integration tests'
  }
];

class TestRunner {
  private results: Map<string, { passed: number; failed: number; total: number }> = new Map();

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting TETRIX Dual Invoice Delivery Test Suite');
    console.log('=' .repeat(60));
    
    for (const suite of TEST_SUITES) {
      await this.runTestSuite(suite);
    }
    
    this.printSummary();
  }

  async runTestSuite(suite: TestSuite): Promise<void> {
    console.log(`\n📋 Running ${suite.name}`);
    console.log(`   ${suite.description}`);
    console.log('-'.repeat(40));
    
    try {
      const command = `npx jest ${suite.path} --config=tests/jest.config.js --verbose`;
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      // Parse Jest output to extract test results
      const lines = output.split('\n');
      let passed = 0;
      let failed = 0;
      let total = 0;
      
      for (const line of lines) {
        if (line.includes('Tests:')) {
          const match = line.match(/(\d+) passed|(\d+) failed/);
          if (match) {
            passed = parseInt(match[1] || '0');
            failed = parseInt(match[2] || '0');
            total = passed + failed;
          }
        }
      }
      
      this.results.set(suite.name, { passed, failed, total });
      
      console.log(`✅ ${suite.name} completed: ${passed} passed, ${failed} failed`);
      
    } catch (error) {
      console.error(`❌ ${suite.name} failed:`, error.message);
      this.results.set(suite.name, { passed: 0, failed: 1, total: 1 });
    }
  }

  async runSpecificTest(testPath: string): Promise<void> {
    console.log(`🎯 Running specific test: ${testPath}`);
    console.log('-'.repeat(40));
    
    try {
      const command = `npx jest ${testPath} --config=tests/jest.config.js --verbose`;
      execSync(command, { stdio: 'inherit' });
      console.log('✅ Test completed successfully');
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      process.exit(1);
    }
  }

  async runWithCoverage(): Promise<void> {
    console.log('📊 Running tests with coverage report');
    console.log('=' .repeat(60));
    
    try {
      const command = 'npx jest --config=tests/jest.config.js --coverage --coverageReporters=text-lcov';
      execSync(command, { stdio: 'inherit' });
      console.log('✅ Coverage report generated');
    } catch (error) {
      console.error('❌ Coverage test failed:', error.message);
      process.exit(1);
    }
  }

  async runWatchMode(): Promise<void> {
    console.log('👀 Starting tests in watch mode');
    console.log('   Press "q" to quit, "a" to run all tests');
    console.log('-'.repeat(40));
    
    try {
      const command = 'npx jest --config=tests/jest.config.js --watch';
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Watch mode failed:', error.message);
      process.exit(1);
    }
  }

  private printSummary(): void {
    console.log('\n📈 Test Summary');
    console.log('=' .repeat(60));
    
    let totalPassed = 0;
    let totalFailed = 0;
    let totalTests = 0;
    
    for (const [suiteName, results] of this.results) {
      console.log(`${suiteName.padEnd(20)} | ${results.passed.toString().padStart(3)} passed | ${results.failed.toString().padStart(3)} failed | ${results.total.toString().padStart(3)} total`);
      totalPassed += results.passed;
      totalFailed += results.failed;
      totalTests += results.total;
    }
    
    console.log('-'.repeat(60));
    console.log(`${'TOTAL'.padEnd(20)} | ${totalPassed.toString().padStart(3)} passed | ${totalFailed.toString().padStart(3)} failed | ${totalTests.toString().padStart(3)} total`);
    
    if (totalFailed === 0) {
      console.log('\n🎉 All tests passed! The dual invoice delivery system is ready for production.');
    } else {
      console.log(`\n⚠️  ${totalFailed} test(s) failed. Please review and fix before deployment.`);
      process.exit(1);
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const runner = new TestRunner();
  
  if (args.length === 0) {
    await runner.runAllTests();
  } else {
    const command = args[0];
    
    switch (command) {
      case 'unit':
        await runner.runSpecificTest('tests/unit');
        break;
      case 'functional':
        await runner.runSpecificTest('tests/functional');
        break;
      case 'integration':
        await runner.runSpecificTest('tests/integration');
        break;
      case 'coverage':
        await runner.runWithCoverage();
        break;
      case 'watch':
        await runner.runWatchMode();
        break;
      case 'help':
        printHelp();
        break;
      default:
        if (command.startsWith('tests/')) {
          await runner.runSpecificTest(command);
        } else {
          console.error(`Unknown command: ${command}`);
          printHelp();
          process.exit(1);
        }
    }
  }
}

function printHelp(): void {
  console.log(`
🧪 TETRIX Dual Invoice Delivery Test Runner

Usage:
  npm run test                    # Run all tests
  npm run test:unit              # Run unit tests only
  npm run test:functional        # Run functional tests only
  npm run test:integration       # Run integration tests only
  npm run test:coverage          # Run tests with coverage report
  npm run test:watch             # Run tests in watch mode
  npm run test tests/path        # Run specific test file

Test Suites:
  Unit Tests        - Individual service and component tests
  Functional Tests  - End-to-end workflow tests
  Integration Tests - Full system integration tests

Coverage:
  - Branches: 80%
  - Functions: 80%
  - Lines: 80%
  - Statements: 80%
`);
}

// Run the CLI
if (require.main === module) {
  main().catch(console.error);
}

export { TestRunner };
