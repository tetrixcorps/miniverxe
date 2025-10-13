#!/usr/bin/env node

import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function execCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

async function checkPrerequisites() {
  log('🔍 Checking prerequisites...', colors.blue);
  
  try {
    // Check if Playwright is installed
    await execCommand('npx playwright --version');
    log('✅ Playwright is installed', colors.green);
  } catch (error) {
    log('❌ Playwright not found. Installing...', colors.red);
    try {
      await execCommand('pnpm install @playwright/test');
      await execCommand('npx playwright install');
      log('✅ Playwright installed successfully', colors.green);
    } catch (installError) {
      log('❌ Failed to install Playwright', colors.red);
      throw installError;
    }
  }
  
  // Check if development server is running
  try {
    await execCommand('curl -s http://localhost:4321 > /dev/null');
    log('✅ Development server is running', colors.green);
  } catch (error) {
    log('⚠️  Development server not detected. Please start it with `pnpm dev`', colors.yellow);
  }
}

async function runTestSuite(testFile, description) {
  log(`\n🧪 Running ${description}...`, colors.cyan);
  
  try {
    const { stdout, stderr } = await execCommand(`npx playwright test ${testFile} --reporter=list`);
    
    // Parse results
    const lines = stdout.split('\n');
    const passedTests = lines.filter(line => line.includes('✓')).length;
    const failedTests = lines.filter(line => line.includes('✗')).length;
    const skippedTests = lines.filter(line => line.includes('○')).length;
    
    log(`✅ ${description} completed:`, colors.green);
    log(`   Passed: ${passedTests}`, colors.green);
    if (failedTests > 0) {
      log(`   Failed: ${failedTests}`, colors.red);
    }
    if (skippedTests > 0) {
      log(`   Skipped: ${skippedTests}`, colors.yellow);
    }
    
    return { passed: passedTests, failed: failedTests, skipped: skippedTests, output: stdout };
  } catch (error) {
    log(`❌ ${description} failed:`, colors.red);
    log(error.stderr || error.stdout, colors.red);
    return { passed: 0, failed: 1, skipped: 0, output: error.stderr || error.stdout };
  }
}

async function generateReport(results) {
  log('\n📊 Generating test report...', colors.blue);
  
  const totalPassed = results.reduce((sum, result) => sum + result.passed, 0);
  const totalFailed = results.reduce((sum, result) => sum + result.failed, 0);
  const totalSkipped = results.reduce((sum, result) => sum + result.skipped, 0);
  const totalTests = totalPassed + totalFailed + totalSkipped;
  
  const report = `
# TETRIX E2E Test Report
Generated on: ${new Date().toISOString()}

## Summary
- **Total Tests**: ${totalTests}
- **Passed**: ${totalPassed}
- **Failed**: ${totalFailed}
- **Skipped**: ${totalSkipped}
- **Success Rate**: ${totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(2) : 0}%

## Test Suites

${results.map((result, index) => `
### ${result.description}
- Passed: ${result.passed}
- Failed: ${result.failed}
- Skipped: ${result.skipped}
`).join('\n')}

## Next Steps
${totalFailed > 0 ? `
⚠️ **${totalFailed} tests failed**
1. Review the test output above
2. Fix any failing tests
3. Run the tests again to verify fixes
` : '✅ All tests passed! Your application is ready for deployment.'}

## Running Individual Test Suites
\`\`\`bash
# Run specific test suites
pnpm test:main      # Main site functionality
pnpm test:api       # API endpoints
pnpm test:admin     # Admin functionality
pnpm test:visual    # Visual regression tests
pnpm test:web-app   # Web app tests

# Run all tests
pnpm test

# Run tests with UI
pnpm test:ui

# Debug tests
pnpm test:debug
\`\`\`
`;

  try {
    await fs.writeFile('test-report.md', report);
    log('✅ Test report generated: test-report.md', colors.green);
  } catch (error) {
    log('❌ Failed to generate test report', colors.red);
  }
  
  return { totalPassed, totalFailed, totalSkipped, totalTests };
}

async function main() {
  log('🚀 Starting TETRIX E2E Test Suite', colors.bright);
  
  const startTime = Date.now();
  
  try {
    await checkPrerequisites();
    
    const testSuites = [
      { file: 'tests/main-site.spec.ts', description: 'Main Site Tests' },
      { file: 'tests/api-endpoints.spec.ts', description: 'API Endpoint Tests' },
      { file: 'tests/admin-functionality.spec.ts', description: 'Admin Functionality Tests' },
      { file: 'tests/web-app.spec.ts', description: 'Web App Tests' },
      { file: 'tests/visual-regression.spec.ts', description: 'Visual Regression Tests' },
    ];
    
    const results = [];
    
    for (const testSuite of testSuites) {
      const result = await runTestSuite(testSuite.file, testSuite.description);
      results.push({ ...result, description: testSuite.description });
    }
    
    const summary = await generateReport(results);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    log(`\n🎉 Test suite completed in ${duration}s`, colors.bright);
    log(`📈 Results: ${summary.totalPassed} passed, ${summary.totalFailed} failed, ${summary.totalSkipped} skipped`, colors.bright);
    
    if (summary.totalFailed > 0) {
      log('\n❌ Some tests failed. Please review the output above and fix any issues.', colors.red);
      process.exit(1);
    } else {
      log('\n✅ All tests passed! Your application is ready for deployment.', colors.green);
    }
    
  } catch (error) {
    log(`\n❌ Test suite failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
TETRIX E2E Test Runner

Usage: node scripts/run-e2e-tests.js [options]

Options:
  --help, -h          Show this help message
  --no-prerequisites  Skip prerequisite checks
  --suite <name>      Run specific test suite only
  --headed            Run tests in headed mode
  --debug             Run tests in debug mode

Examples:
  node scripts/run-e2e-tests.js
  node scripts/run-e2e-tests.js --suite main-site
  node scripts/run-e2e-tests.js --headed
  node scripts/run-e2e-tests.js --debug
`);
  process.exit(0);
}

main().catch(console.error);