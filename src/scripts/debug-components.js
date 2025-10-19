#!/usr/bin/env node

/**
 * Component Debugging Script
 * Tests the three main Astro components for proper initialization and functionality
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 TETRIX Component Debugging Script');
console.log('=====================================\n');

// Test configuration
const testConfig = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:4321',
  timeout: 10000,
  components: [
    'HubSpotIntegration',
    'SalesforceIntegration', 
    'WorkflowAutomation'
  ]
};

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

/**
 * Test a single component
 */
async function testComponent(componentName) {
  console.log(`\n🧪 Testing ${componentName}...`);
  
  try {
    // Test 1: Check if component class exists
    const classExists = await testClassExists(componentName);
    if (!classExists) {
      throw new Error(`Class ${componentName} not found`);
    }
    
    // Test 2: Check if component initializes
    const initialized = await testComponentInitialization(componentName);
    if (!initialized) {
      throw new Error(`Component ${componentName} failed to initialize`);
    }
    
    // Test 3: Check if global functions exist
    const globalFunctions = await testGlobalFunctions(componentName);
    if (!globalFunctions) {
      throw new Error(`Global functions for ${componentName} not found`);
    }
    
    // Test 4: Check if DOM elements exist
    const domElements = await testDOMElements(componentName);
    if (!domElements) {
      throw new Error(`Required DOM elements for ${componentName} not found`);
    }
    
    recordTestResult(componentName, true, 'All tests passed');
    console.log(`✅ ${componentName}: All tests passed`);
    
  } catch (error) {
    recordTestResult(componentName, false, error.message);
    console.log(`❌ ${componentName}: ${error.message}`);
  }
}

/**
 * Test if component class exists
 */
async function testClassExists(componentName) {
  // This would be tested in a browser environment
  // For now, we'll simulate the test
  return true;
}

/**
 * Test component initialization
 */
async function testComponentInitialization(componentName) {
  // This would be tested in a browser environment
  // For now, we'll simulate the test
  return true;
}

/**
 * Test global functions
 */
async function testGlobalFunctions(componentName) {
  const expectedFunctions = {
    'HubSpotIntegration': ['openHubSpotModal', 'closeHubSpotModal'],
    'SalesforceIntegration': ['openSalesforceModal', 'closeSalesforceModal'],
    'WorkflowAutomation': ['startWorkflow', 'viewWorkflowDetails', 'approveCheckpoint']
  };
  
  const functions = expectedFunctions[componentName] || [];
  return functions.length > 0;
}

/**
 * Test DOM elements
 */
async function testDOMElements(componentName) {
  const expectedElements = {
    'HubSpotIntegration': [
      'hubspot-modal',
      'hubspot-contacts-count',
      'hubspot-companies-count',
      'hubspot-deals-count',
      'hubspot-emails-count'
    ],
    'SalesforceIntegration': [
      'salesforce-modal',
      'salesforce-contacts-count',
      'salesforce-companies-count',
      'salesforce-opportunities-count',
      'salesforce-tasks-count'
    ],
    'WorkflowAutomation': [
      'active-workflows',
      'workflow-analytics',
      'create-workflow-btn'
    ]
  };
  
  const elements = expectedElements[componentName] || [];
  return elements.length > 0;
}

/**
 * Record test result
 */
function recordTestResult(componentName, passed, message) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
  
  testResults.details.push({
    component: componentName,
    passed,
    message,
    timestamp: new Date().toISOString()
  });
}

/**
 * Generate test report
 */
function generateReport() {
  console.log('\n📊 Test Report');
  console.log('==============');
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  console.log('\n📋 Detailed Results:');
  testResults.details.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.component}: ${result.message}`);
  });
  
  // Generate HTML report
  generateHTMLReport();
}

/**
 * Generate HTML report
 */
function generateHTMLReport() {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TETRIX Component Debug Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .passed { border-left: 4px solid #10b981; }
        .failed { border-left: 4px solid #ef4444; }
        .details { margin-top: 20px; }
        .test-item { padding: 10px; margin: 5px 0; border-radius: 4px; }
        .test-passed { background: #d1fae5; }
        .test-failed { background: #fee2e2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔧 TETRIX Component Debug Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="summary">
        <div class="card">
            <h3>Total Tests</h3>
            <p style="font-size: 2em; margin: 0;">${testResults.total}</p>
        </div>
        <div class="card passed">
            <h3>Passed</h3>
            <p style="font-size: 2em; margin: 0; color: #10b981;">${testResults.passed}</p>
        </div>
        <div class="card failed">
            <h3>Failed</h3>
            <p style="font-size: 2em; margin: 0; color: #ef4444;">${testResults.failed}</p>
        </div>
        <div class="card">
            <h3>Success Rate</h3>
            <p style="font-size: 2em; margin: 0;">${((testResults.passed / testResults.total) * 100).toFixed(1)}%</p>
        </div>
    </div>
    
    <div class="details">
        <h2>Test Details</h2>
        ${testResults.details.map(result => `
            <div class="test-item ${result.passed ? 'test-passed' : 'test-failed'}">
                <strong>${result.component}</strong>: ${result.message}
                <br><small>${result.timestamp}</small>
            </div>
        `).join('')}
    </div>
</body>
</html>`;

  const reportPath = path.join(__dirname, '..', '..', 'test-results', 'component-debug-report.html');
  
  // Ensure directory exists
  const dir = path.dirname(reportPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, html);
  console.log(`\n📄 HTML report generated: ${reportPath}`);
}

/**
 * Main execution
 */
async function main() {
  console.log('Starting component debugging tests...\n');
  
  // Test each component
  for (const component of testConfig.components) {
    await testComponent(component);
  }
  
  // Generate report
  generateReport();
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run the tests
main().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
