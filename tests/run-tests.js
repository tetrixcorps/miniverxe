#!/usr/bin/env node
/**
 * Test Runner for SHANGO Chat Widget Integration
 * Runs unit, functional, and integration tests
 */

const { execSync } = require('child_process');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n${colors.cyan}${description}${colors.reset}`);
  log(`${colors.yellow}Running: ${command}${colors.reset}\n`);
  
  try {
    const output = execSync(command, { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    log(`${colors.green}✅ ${description} completed successfully${colors.reset}`);
    return true;
  } catch (error) {
    log(`${colors.red}❌ ${description} failed${colors.reset}`);
    log(`${colors.red}Error: ${error.message}${colors.reset}`);
    return false;
  }
}

function main() {
  log(`${colors.bright}${colors.blue}🚀 SHANGO Chat Widget Test Suite${colors.reset}`);
  log(`${colors.blue}==========================================${colors.reset}\n`);

  const tests = [
    {
      command: 'npm run test:jest:unit',
      description: 'Unit Tests (SHANGO Chat Widget & SinchChatLive Service)'
    },
    {
      command: 'npm run test:jest:functional',
      description: 'Functional Tests (Complete Chat Integration)'
    },
    {
      command: 'npm run test:jest:integration',
      description: 'Integration Tests (Contact Page Integration)'
    },
    {
      command: 'npm run test:jest:coverage',
      description: 'Coverage Report (All Tests with Coverage)'
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const success = runCommand(test.command, test.description);
    if (success) {
      passed++;
    } else {
      failed++;
    }
  }

  // Summary
  log(`\n${colors.blue}==========================================${colors.reset}`);
  log(`${colors.bright}📊 Test Summary${colors.reset}`);
  log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
  log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
  
  if (failed === 0) {
    log(`${colors.green}${colors.bright}🎉 All tests passed! SHANGO Chat Widget is ready for production.${colors.reset}`);
    process.exit(0);
  } else {
    log(`${colors.red}${colors.bright}⚠️  Some tests failed. Please review the output above.${colors.reset}`);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  log(`${colors.bright}SHANGO Chat Widget Test Runner${colors.reset}\n`);
  log('Usage: node tests/run-tests.js [options]');
  log('\nOptions:');
  log('  --help, -h     Show this help message');
  log('  --unit         Run only unit tests');
  log('  --functional   Run only functional tests');
  log('  --integration  Run only integration tests');
  log('  --coverage     Run tests with coverage report');
  log('\nExamples:');
  log('  node tests/run-tests.js                    # Run all tests');
  log('  node tests/run-tests.js --unit             # Run only unit tests');
  log('  node tests/run-tests.js --coverage         # Run with coverage');
  process.exit(0);
}

if (args.includes('--unit')) {
  runCommand('npm run test:jest:unit', 'Unit Tests Only');
} else if (args.includes('--functional')) {
  runCommand('npm run test:jest:functional', 'Functional Tests Only');
} else if (args.includes('--integration')) {
  runCommand('npm run test:jest:integration', 'Integration Tests Only');
} else if (args.includes('--coverage')) {
  runCommand('npm run test:jest:coverage', 'Tests with Coverage');
} else {
  main();
}
