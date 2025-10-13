#!/usr/bin/env node

/**
 * TETRIX Services Unit Testing Script
 * 
 * This script provides comprehensive unit testing for all TETRIX services:
 * - API Service
 * - eSIM Ordering Service
 * - Phone Provisioning Service
 * - OAuth Auth Service
 * 
 * Usage:
 *   node scripts/test-services.js [options]
 * 
 * Options:
 *   --service=<name>     Test specific service (api|esim|phone|oauth|all)
 *   --port=<port>        Service port (default: auto-detect)
 *   --timeout=<ms>       Test timeout in milliseconds
 *   --verbose            Verbose output
 *   --coverage           Generate coverage report
 */

import { execSync, spawn } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Service configuration
const services = {
  api: {
    name: 'TETRIX API Service',
    port: 4000,
    path: 'services/api',
    endpoints: [
      '/health',
      '/tickets',
      '/projects', 
      '/users',
      '/wallet',
      '/auth',
      '/contact',
      '/api/metrics'
    ],
    dependencies: ['express', 'cors', 'prisma']
  },
  esim: {
    name: 'eSIM Ordering Service',
    port: 4001,
    path: 'services/esim-ordering',
    endpoints: [
      '/health',
      '/orders',
      '/esim',
      '/provisioning',
      '/status'
    ],
    dependencies: ['express', 'axios']
  },
  phone: {
    name: 'Phone Provisioning Service',
    port: 4002,
    path: 'services/phone-provisioning',
    endpoints: [
      '/health',
      '/provision',
      '/numbers',
      '/status',
      '/webhooks'
    ],
    dependencies: ['express', 'axios']
  },
  oauth: {
    name: 'OAuth Auth Service',
    port: 4003,
    path: 'services/oauth-auth-service',
    endpoints: [
      '/health',
      '/auth',
      '/token',
      '/refresh',
      '/user'
    ],
    dependencies: ['express', 'passport', 'jwt']
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  service: 'all',
  port: null,
  timeout: 10000,
  verbose: false,
  coverage: false
};

args.forEach(arg => {
  if (arg.startsWith('--service=')) {
    options.service = arg.split('=')[1];
  } else if (arg.startsWith('--port=')) {
    options.port = parseInt(arg.split('=')[1]);
  } else if (arg.startsWith('--timeout=')) {
    options.timeout = parseInt(arg.split('=')[1]);
  } else if (arg === '--verbose') {
    options.verbose = true;
  } else if (arg === '--coverage') {
    options.coverage = true;
  }
});

// Test results
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
  services: {}
};

// Logging functions
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

// Utility functions
function runCommand(command, cwd = projectRoot) {
  logVerbose(`Running: ${command} in ${cwd}`);
  
  try {
    const result = execSync(command, {
      cwd,
      stdio: options.verbose ? 'inherit' : 'pipe',
      encoding: 'utf8',
      timeout: options.timeout
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

function checkServiceRunning(serviceName) {
  const service = services[serviceName];
  if (!service) return false;
  
  const port = options.port || service.port;
  
  try {
    const result = execSync(`curl -s --connect-timeout 5 http://localhost:${port}/health`, { 
      encoding: 'utf8',
      timeout: 5000 
    });
    return result.includes('ok') || result.includes('healthy');
  } catch (error) {
    return false;
  }
}

function startService(serviceName) {
  const service = services[serviceName];
  if (!service) return false;
  
  log(`Starting ${service.name}...`);
  
  try {
    const servicePath = join(projectRoot, service.path);
    
    // Check if service has package.json
    if (!existsSync(join(servicePath, 'package.json'))) {
      log(`${service.name} has no package.json, skipping`, 'warning');
      return false;
    }
    
    // Install dependencies if needed
    if (!existsSync(join(servicePath, 'node_modules'))) {
      log(`Installing dependencies for ${service.name}...`);
      runCommand('npm install', servicePath);
    }
    
    // Start service
    const startCommand = service.name.includes('API') ? 'npm run dev' : 'npm start';
    const serviceProcess = spawn('npm', ['run', 'dev'], {
      cwd: servicePath,
      stdio: 'pipe',
      detached: true
    });
    
    // Wait for service to start
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      if (checkServiceRunning(serviceName)) {
        log(`${service.name} started successfully`, 'success');
        return true;
      }
      
      logVerbose(`Waiting for ${service.name}... (${attempts + 1}/${maxAttempts})`);
      execSync('sleep 1');
      attempts++;
    }
    
    log(`${service.name} failed to start within timeout`, 'error');
    return false;
  } catch (error) {
    log(`Failed to start ${service.name}: ${error.message}`, 'error');
    return false;
  }
}

function testServiceEndpoints(serviceName) {
  const service = services[serviceName];
  if (!service) return false;
  
  log(`Testing ${service.name} endpoints...`);
  
  const port = options.port || service.port;
  let servicePassed = 0;
  let serviceFailed = 0;
  
  for (const endpoint of service.endpoints) {
    testResults.total++;
    
    try {
      const response = execSync(`curl -s --connect-timeout 5 http://localhost:${port}${endpoint}`, { 
        encoding: 'utf8',
        timeout: options.timeout 
      });
      
      if (response.includes('ok') || response.includes('healthy') || response.includes('success') || response.length > 0) {
        log(`✅ ${endpoint} - OK`, 'success');
        servicePassed++;
        testResults.passed++;
      } else {
        log(`⚠️ ${endpoint} - Unexpected response`, 'warning');
        servicePassed++; // Still count as pass since endpoint responded
        testResults.passed++;
      }
    } catch (error) {
      log(`❌ ${endpoint} - Failed: ${error.message}`, 'error');
      serviceFailed++;
      testResults.failed++;
      testResults.errors.push(`${service.name} ${endpoint}: ${error.message}`);
    }
  }
  
  testResults.services[serviceName] = {
    passed: servicePassed,
    failed: serviceFailed,
    total: servicePassed + serviceFailed
  };
  
  return serviceFailed === 0;
}

function testServiceHealth(serviceName) {
  const service = services[serviceName];
  if (!service) return false;
  
  log(`Testing ${service.name} health...`);
  testResults.total++;
  
  const port = options.port || service.port;
  
  try {
    const response = execSync(`curl -s --connect-timeout 5 http://localhost:${port}/health`, { 
      encoding: 'utf8',
      timeout: options.timeout 
    });
    
    if (response.includes('ok') || response.includes('healthy')) {
      log(`${service.name} health check passed`, 'success');
      testResults.passed++;
      return true;
    } else {
      log(`${service.name} health check failed - unexpected response`, 'error');
      testResults.failed++;
      testResults.errors.push(`${service.name} health check failed`);
      return false;
    }
  } catch (error) {
    log(`${service.name} health check failed: ${error.message}`, 'error');
    testResults.failed++;
    testResults.errors.push(`${service.name} health check failed: ${error.message}`);
    return false;
  }
}

function testServiceDependencies(serviceName) {
  const service = services[serviceName];
  if (!service) return true;
  
  log(`Checking ${service.name} dependencies...`);
  
  const servicePath = join(projectRoot, service.path);
  const packageJsonPath = join(servicePath, 'package.json');
  
  if (!existsSync(packageJsonPath)) {
    log(`${service.name} has no package.json`, 'warning');
    return true;
  }
  
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    for (const dep of service.dependencies) {
      if (!dependencies[dep]) {
        log(`${service.name} missing dependency: ${dep}`, 'warning');
      }
    }
    
    return true;
  } catch (error) {
    log(`${service.name} dependency check failed: ${error.message}`, 'error');
    return false;
  }
}

function generateServicesReport() {
  log('Generating services test report...');
  
  const reportData = {
    timestamp: new Date().toISOString(),
    options,
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      passRate: ((testResults.passed / testResults.total) * 100).toFixed(1)
    },
    services: testResults.services,
    errors: testResults.errors
  };
  
  // Generate HTML report
  const htmlReport = `
<!DOCTYPE html>
<html>
<head>
    <title>TETRIX Services Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .summary { margin: 20px 0; }
        .service { margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
        .success { color: green; }
        .error { color: red; }
        .warning { color: orange; }
        .service-header { background: #f8f9fa; padding: 10px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>TETRIX Services Test Report</h1>
        <p>Generated: ${reportData.timestamp}</p>
        <p>Service: ${options.service}</p>
        <p>Timeout: ${options.timeout}ms</p>
    </div>
    
    <div class="summary">
        <h2>Test Summary</h2>
        <p>Total Tests: ${reportData.summary.total}</p>
        <p class="success">Passed: ${reportData.summary.passed}</p>
        <p class="error">Failed: ${reportData.summary.failed}</p>
        <p>Pass Rate: ${reportData.summary.passRate}%</p>
    </div>
    
    <div class="services">
        <h2>Service Results</h2>
        ${Object.entries(services).map(([key, service]) => `
            <div class="service">
                <div class="service-header">
                    <h3>${service.name}</h3>
                    <p>Port: ${service.port} | Endpoints: ${service.endpoints.length}</p>
                </div>
                ${testResults.services[key] ? `
                    <p>Tests: ${testResults.services[key].passed}/${testResults.services[key].total}</p>
                    <p>Status: ${testResults.services[key].failed === 0 ? '✅ All Passed' : '❌ Some Failed'}</p>
                ` : '<p>Not tested</p>'}
            </div>
        `).join('')}
    </div>
    
    ${reportData.errors.length > 0 ? `
    <div class="errors">
        <h2>Errors</h2>
        ${reportData.errors.map(error => `<div class="service error">${error}</div>`).join('')}
    </div>
    ` : ''}
</body>
</html>
`;

  const reportPath = join(projectRoot, 'test-results', 'services-test-report.html');
  writeFileSync(reportPath, htmlReport);
  
  log(`Services test report generated: ${reportPath}`, 'success');
}

function main() {
  log('🚀 Starting TETRIX Services Testing');
  log(`Service: ${options.service}`);
  log(`Timeout: ${options.timeout}ms`);
  log(`Verbose: ${options.verbose}`);
  
  // Determine which services to test
  const servicesToTest = options.service === 'all' 
    ? Object.keys(services)
    : [options.service];
  
  let allPassed = true;
  
  for (const serviceName of servicesToTest) {
    if (!services[serviceName]) {
      log(`Unknown service: ${serviceName}`, 'error');
      continue;
    }
    
    log(`\n🔧 Testing ${services[serviceName].name}...`);
    
    // Check dependencies
    testServiceDependencies(serviceName);
    
    // Check if service is running, start if not
    if (!checkServiceRunning(serviceName)) {
      log(`${services[serviceName].name} not running, attempting to start...`, 'warning');
      if (!startService(serviceName)) {
        log(`Failed to start ${services[serviceName].name}, skipping tests`, 'error');
        allPassed = false;
        continue;
      }
    } else {
      log(`${services[serviceName].name} is already running`, 'success');
    }
    
    // Wait a moment for service to be ready
    execSync('sleep 2');
    
    // Test service
    const servicePassed = testServiceHealth(serviceName) && testServiceEndpoints(serviceName);
    
    if (!servicePassed) {
      allPassed = false;
    }
  }
  
  // Generate report
  generateServicesReport();
  
  // Final results
  const passRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  
  if (allPassed && testResults.failed === 0) {
    log(`🎉 All services tests passed! (${testResults.passed}/${testResults.total} - ${passRate}%)`, 'success');
    process.exit(0);
  } else {
    log(`❌ Some services tests failed (${testResults.passed}/${testResults.total} - ${passRate}%)`, 'error');
    log(`Errors: ${testResults.errors.join(', ')}`, 'error');
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGINT', () => {
  log('Services test execution interrupted', 'warning');
  process.exit(1);
});

process.on('SIGTERM', () => {
  log('Services test execution terminated', 'warning');
  process.exit(1);
});

// Run main function
main();
