#!/usr/bin/env ts-node

/**
 * TETRIX 2FA Authentication System Test Runner
 * 
 * This script runs comprehensive tests for the 2FA authentication system including:
 * - Unit tests for modal functionality
 * - Unit tests for API endpoints
 * - Functional tests for complete authentication flows
 * - Integration tests for system-wide functionality
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

interface TestConfig {
  name: string;
  command: string;
  description: string;
  category: 'unit' | 'functional' | 'integration' | 'all';
}

const testConfigs: TestConfig[] = [
  {
    name: '2fa-modal-unit',
    command: 'vitest run tests/unit/2FAModal.test.ts',
    description: 'Unit tests for 2FA modal functionality',
    category: 'unit'
  },
  {
    name: '2fa-api-unit',
    command: 'vitest run tests/unit/2FAAPI.test.ts',
    description: 'Unit tests for 2FA API endpoints',
    category: 'unit'
  },
  {
    name: '2fa-flow-functional',
    command: 'vitest run tests/functional/2FAFlow.test.ts',
    description: 'Functional tests for 2FA authentication flows',
    category: 'functional'
  },
  {
    name: '2fa-system-integration',
    command: 'vitest run tests/integration/2FASystem.test.ts',
    description: 'Integration tests for complete 2FA system',
    category: 'integration'
  },
  {
    name: 'all-2fa-tests',
    command: 'vitest run tests/unit/2FAModal.test.ts tests/unit/2FAAPI.test.ts tests/functional/2FAFlow.test.ts tests/integration/2FASystem.test.ts',
    description: 'All 2FA related tests',
    category: 'all'
  }
];

class TestRunner {
  private results: { [key: string]: { success: boolean; output: string; duration: number } } = {};

  async runTest(config: TestConfig): Promise<void> {
    console.log(`\n🧪 Running ${config.name}...`);
    console.log(`📝 ${config.description}`);
    console.log(`⚡ Command: ${config.command}`);
    console.log('─'.repeat(60));

    const startTime = Date.now();

    try {
      const output = execSync(config.command, {
        encoding: 'utf8',
        stdio: 'pipe',
        cwd: process.cwd()
      });

      const duration = Date.now() - startTime;
      this.results[config.name] = {
        success: true,
        output: output,
        duration: duration
      };

      console.log(`✅ ${config.name} completed successfully in ${duration}ms`);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.results[config.name] = {
        success: false,
        output: error.stdout || error.message,
        duration: duration
      };

      console.log(`❌ ${config.name} failed after ${duration}ms`);
      console.log('Error output:', error.stdout || error.message);
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 TETRIX 2FA Authentication System Test Suite');
    console.log('═'.repeat(60));

    for (const config of testConfigs) {
      await this.runTest(config);
    }

    this.printSummary();
  }

  async runByCategory(category: 'unit' | 'functional' | 'integration' | 'all'): Promise<void> {
    console.log(`🎯 Running ${category} tests for 2FA system`);
    console.log('═'.repeat(60));

    const configs = testConfigs.filter(config => config.category === category);
    
    for (const config of configs) {
      await this.runTest(config);
    }

    this.printSummary();
  }

  private printSummary(): void {
    console.log('\n📊 Test Results Summary');
    console.log('═'.repeat(60));

    const categories = ['unit', 'functional', 'integration', 'all'];
    let totalTests = 0;
    let passedTests = 0;
    let totalDuration = 0;

    for (const category of categories) {
      const categoryTests = testConfigs.filter(config => config.category === category);
      
      if (categoryTests.length > 0) {
        console.log(`\n📁 ${category.toUpperCase()} Tests:`);
        
        for (const config of categoryTests) {
          const result = this.results[config.name];
          if (result) {
            totalTests++;
            totalDuration += result.duration;
            
            if (result.success) {
              passedTests++;
              console.log(`  ✅ ${config.name}: PASSED (${result.duration}ms)`);
            } else {
              console.log(`  ❌ ${config.name}: FAILED (${result.duration}ms)`);
            }
          }
        }
      }
    }

    console.log('\n📈 Overall Statistics:');
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Passed: ${passedTests}`);
    console.log(`  Failed: ${totalTests - passedTests}`);
    console.log(`  Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log(`  Total Duration: ${totalDuration}ms`);

    if (passedTests === totalTests) {
      console.log('\n🎉 All tests passed! 2FA system is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the output above.');
      process.exit(1);
    }
  }

  printHelp(): void {
    console.log('TETRIX 2FA Authentication System Test Runner');
    console.log('═'.repeat(60));
    console.log('Usage: ts-node tests/run2FATests.ts [category]');
    console.log('');
    console.log('Categories:');
    console.log('  unit        - Run unit tests only');
    console.log('  functional  - Run functional tests only');
    console.log('  integration - Run integration tests only');
    console.log('  all         - Run all 2FA tests (default)');
    console.log('  help        - Show this help message');
    console.log('');
    console.log('Examples:');
    console.log('  ts-node tests/run2FATests.ts');
    console.log('  ts-node tests/run2FATests.ts unit');
    console.log('  ts-node tests/run2FATests.ts functional');
    console.log('  ts-node tests/run2FATests.ts integration');
  }
}

async function main() {
  const args = process.argv.slice(2);
  const category = args[0] as 'unit' | 'functional' | 'integration' | 'all' | 'help' | undefined;

  const runner = new TestRunner();

  if (category === 'help' || category === '--help' || category === '-h') {
    runner.printHelp();
    return;
  }

  // Check if vitest is available
  if (!existsSync(join(process.cwd(), 'node_modules', 'vitest'))) {
    console.error('❌ Vitest is not installed. Please run: npm install');
    process.exit(1);
  }

  if (category && ['unit', 'functional', 'integration', 'all'].includes(category)) {
    await runner.runByCategory(category);
  } else {
    await runner.runAllTests();
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

export { TestRunner };
