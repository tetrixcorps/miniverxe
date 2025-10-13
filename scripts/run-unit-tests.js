#!/usr/bin/env node

/**
 * TETRIX Cross-Platform Unit Testing Script
 * 
 * This script provides comprehensive unit testing for:
 * - TETRIX Voice API services
 * - JoRoMi VoIP management
 * - GLO M2M communication
 * - Cross-platform integration
 * 
 * Usage:
 *   node scripts/run-unit-tests.js [options]
 * 
 * Options:
 *   --component=<name>    Test specific component (tetrix|joromi|glo|all)
 *   --coverage           Generate coverage report
 *   --watch              Watch mode for development
 *   --verbose             Verbose output
 *   --parallel           Run tests in parallel
 *   --timeout=<ms>       Test timeout in milliseconds
 *   --retry=<count>      Retry failed tests
 *   --report=<format>    Report format (html|json|junit)
 */

import { execSync, spawn } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Configuration
const config = {
  components: {
    tetrix: {
      name: 'TETRIX Voice API',
      testDir: 'tests/unit',
      configFile: 'playwright.config.js',
      services: ['voice-api', 'transcription', 'ai-response', 'texml']
    },
    joromi: {
      name: 'JoRoMi VoIP Management',
      testDir: '../joromi/tests/unit',
      configFile: '../joromi/playwright.config.js',
      services: ['voip-management', 'toll-free', 'ivr', 'sms']
    },
    glo: {
      name: 'GLO M2M Services',
      testDir: '../glo/tests/unit',
      configFile: '../glo/playwright.config.js',
      services: ['m2m-auth', 'session-manager', 'telemetry', 'vpn-gateway']
    }
  },
  testTypes: {
    unit: 'Unit Tests',
    integration: 'Integration Tests',
    functional: 'Functional Tests',
    e2e: 'End-to-End Tests'
  },
  reportFormats: ['html', 'json', 'junit'],
  defaultTimeout: 30000,
  defaultRetries: 2
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  component: 'all',
  coverage: false,
  watch: false,
  verbose: false,
  parallel: true,
  timeout: config.defaultTimeout,
  retry: config.defaultRetries,
  report: 'html'
};

// Parse arguments
args.forEach(arg => {
  if (arg.startsWith('--component=')) {
    options.component = arg.split('=')[1];
  } else if (arg === '--coverage') {
    options.coverage = true;
  } else if (arg === '--watch') {
    options.watch = true;
  } else if (arg === '--verbose') {
    options.verbose = true;
  } else if (arg === '--parallel') {
    options.parallel = true;
  } else if (arg.startsWith('--timeout=')) {
    options.timeout = parseInt(arg.split('=')[1]);
  } else if (arg.startsWith('--retry=')) {
    options.retry = parseInt(arg.split('=')[1]);
  } else if (arg.startsWith('--report=')) {
    options.report = arg.split('=')[1];
  }
});

// Utility functions
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '🔵',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    debug: '🔍'
  }[level] || '🔵';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function logVerbose(message) {
  if (options.verbose) {
    log(message, 'debug');
  }
}

function runCommand(command, cwd = projectRoot) {
  logVerbose(`Running: ${command} in ${cwd}`);
  
  try {
    const result = execSync(command, {
      cwd,
      stdio: options.verbose ? 'inherit' : 'pipe',
      encoding: 'utf8'
    });
    return { success: true, output: result };
  } catch (error) {
    return { 
      success: false, 
      error: error.message, 
      output: error.stdout || error.stderr 
    };
  }
}

function checkDependencies() {
  log('Checking dependencies...');
  
  const requiredDeps = ['playwright', 'node'];
  const missingDeps = [];
  
  requiredDeps.forEach(dep => {
    try {
      execSync(`${dep} --version`, { stdio: 'pipe' });
    } catch {
      missingDeps.push(dep);
    }
  });
  
  if (missingDeps.length > 0) {
    log(`Missing dependencies: ${missingDeps.join(', ')}`, 'error');
    log('Please install missing dependencies:', 'error');
    missingDeps.forEach(dep => {
      if (dep === 'playwright') {
        log('  pnpm install playwright', 'error');
        log('  pnpm exec playwright install', 'error');
      }
    });
    process.exit(1);
  }
  
  log('All dependencies found', 'success');
}

function generateTestConfig() {
  log('Generating test configuration...');
  
  const playwrightConfig = `
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/unit',
  fullyParallel: ${options.parallel},
  forbidOnly: !!process.env.CI,
  retries: ${options.retry},
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'unit-tests',
      testMatch: '**/unit/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: ${options.timeout}
  }
});
`;

  writeFileSync(join(projectRoot, 'playwright.config.js'), playwrightConfig);
  log('Test configuration generated', 'success');
}

function runComponentTests(componentName) {
  const component = config.components[componentName];
  if (!component) {
    log(`Unknown component: ${componentName}`, 'error');
    return false;
  }
  
  log(`Running tests for ${component.name}...`);
  
  const testDir = join(projectRoot, component.testDir);
  if (!existsSync(testDir)) {
    log(`Test directory not found: ${testDir}`, 'warning');
    log(`Creating test directory: ${testDir}`);
    execSync(`mkdir -p ${testDir}`, { cwd: projectRoot });
  }
  
  const playwrightConfig = join(projectRoot, component.configFile);
  if (!existsSync(playwrightConfig)) {
    log(`Playwright config not found: ${playwrightConfig}`, 'warning');
    generateTestConfig();
  }
  
  const testCommand = [
    'npx playwright test',
    `--config=${playwrightConfig}`,
    `--timeout=${options.timeout}`,
    `--retries=${options.retry}`,
    options.parallel ? '--workers=4' : '--workers=1',
    options.verbose ? '--reporter=list' : '--reporter=html',
    options.watch ? '--watch' : ''
  ].filter(Boolean).join(' ');
  
  const result = runCommand(testCommand);
  
  if (result.success) {
    log(`${component.name} tests completed successfully`, 'success');
    return true;
  } else {
    log(`${component.name} tests failed: ${result.error}`, 'error');
    return false;
  }
}

function runCoverageReport() {
  if (!options.coverage) return;
  
  log('Generating coverage report...');
  
  const coverageCommand = [
    'npx playwright test',
    '--reporter=html',
    '--reporter=json',
    '--output=test-results/coverage'
  ].join(' ');
  
  const result = runCommand(coverageCommand);
  
  if (result.success) {
    log('Coverage report generated', 'success');
    log('View report at: test-results/coverage/index.html');
  } else {
    log('Failed to generate coverage report', 'error');
  }
}

function generateTestReport() {
  log('Generating test report...');
  
  const reportData = {
    timestamp: new Date().toISOString(),
    options,
    results: {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    },
    components: {}
  };
  
  // Read test results if available
  const resultsFile = join(projectRoot, 'test-results/results.json');
  if (existsSync(resultsFile)) {
    try {
      const results = JSON.parse(readFileSync(resultsFile, 'utf8'));
      reportData.results = results;
    } catch (error) {
      log(`Failed to read test results: ${error.message}`, 'warning');
    }
  }
  
  // Generate HTML report
  const htmlReport = `
<!DOCTYPE html>
<html>
<head>
    <title>TETRIX Unit Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .summary { margin: 20px 0; }
        .component { margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
        .success { color: green; }
        .error { color: red; }
        .warning { color: orange; }
    </style>
</head>
<body>
    <div class="header">
        <h1>TETRIX Cross-Platform Unit Test Report</h1>
        <p>Generated: ${reportData.timestamp}</p>
    </div>
    
    <div class="summary">
        <h2>Test Summary</h2>
        <p>Total Tests: ${reportData.results.total}</p>
        <p class="success">Passed: ${reportData.results.passed}</p>
        <p class="error">Failed: ${reportData.results.failed}</p>
        <p class="warning">Skipped: ${reportData.results.skipped}</p>
    </div>
    
    <div class="components">
        <h2>Component Results</h2>
        ${Object.entries(config.components).map(([key, component]) => `
            <div class="component">
                <h3>${component.name}</h3>
                <p>Services: ${component.services.join(', ')}</p>
            </div>
        `).join('')}
    </div>
</body>
</html>
`;

  writeFileSync(join(projectRoot, 'test-results/report.html'), htmlReport);
  log('Test report generated: test-results/report.html', 'success');
}

function main() {
  log('🚀 Starting TETRIX Cross-Platform Unit Testing');
  log(`Options: ${JSON.stringify(options, null, 2)}`);
  
  // Check dependencies
  checkDependencies();
  
  // Generate test configuration
  generateTestConfig();
  
  // Run tests based on component selection
  const componentsToTest = options.component === 'all' 
    ? Object.keys(config.components)
    : [options.component];
  
  let allPassed = true;
  
  for (const component of componentsToTest) {
    if (config.components[component]) {
      const success = runComponentTests(component);
      if (!success) {
        allPassed = false;
      }
    } else {
      log(`Skipping unknown component: ${component}`, 'warning');
    }
  }
  
  // Generate coverage report if requested
  runCoverageReport();
  
  // Generate test report
  generateTestReport();
  
  // Final results
  if (allPassed) {
    log('🎉 All unit tests completed successfully!', 'success');
    process.exit(0);
  } else {
    log('❌ Some unit tests failed', 'error');
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGINT', () => {
  log('Test execution interrupted', 'warning');
  process.exit(1);
});

process.on('SIGTERM', () => {
  log('Test execution terminated', 'warning');
  process.exit(1);
});

// Run main function
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// Export configuration for external use
export { config, options };
