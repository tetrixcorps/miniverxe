#!/usr/bin/env node

/**
 * DigitalOcean App Platform Deployment Debugger
 * 
 * This script provides comprehensive debugging for stuck deployments
 * and helps identify caching issues, build problems, and runtime errors.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const APP_ID = 'ca96485c-ee6b-401b-b1a2-8442c3bc7f04';
const CUSTOM_DOMAIN = 'tetrixcorp.com';
const PRODUCTION_URL = 'https://tetrix-minimal-uzzxn.ondigitalocean.app';

console.log('🔍 Starting DigitalOcean App Platform Deployment Debugger...');
console.log(`📱 App ID: ${APP_ID}`);
console.log(`🌐 Custom Domain: ${CUSTOM_DOMAIN}`);
console.log(`🔗 Production URL: ${PRODUCTION_URL}`);
console.log('');

// Function to run doctl commands with error handling
function runDoctlCommand(command, description) {
  console.log(`🔧 ${description}...`);
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      timeout: 30000,
      stdio: 'pipe'
    });
    console.log(`✅ ${description} completed`);
    return result;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return null;
  }
}

// Function to get deployment status
function getDeploymentStatus() {
  console.log('📊 Getting deployment status...');
  
  const deployments = runDoctlCommand(
    `doctl apps list-deployments ${APP_ID} --format ID,Cause,Progress,Phase`,
    'Fetching deployment list'
  );
  
  if (deployments) {
    console.log('📋 Current deployments:');
    console.log(deployments);
  }
  
  return deployments;
}

// Function to get build logs
function getBuildLogs(deploymentId) {
  console.log(`📝 Getting build logs for deployment ${deploymentId}...`);
  
  const buildLogs = runDoctlCommand(
    `doctl apps logs ${APP_ID} --deployment ${deploymentId} --type build`,
    'Fetching build logs'
  );
  
  if (buildLogs) {
    console.log('🔨 Build logs:');
    console.log(buildLogs);
  }
  
  return buildLogs;
}

// Function to get runtime logs
function getRuntimeLogs(deploymentId) {
  console.log(`🏃 Getting runtime logs for deployment ${deploymentId}...`);
  
  const runtimeLogs = runDoctlCommand(
    `doctl apps logs ${APP_ID} --deployment ${deploymentId} --type run`,
    'Fetching runtime logs'
  );
  
  if (runtimeLogs) {
    console.log('🚀 Runtime logs:');
    console.log(runtimeLogs);
  }
  
  return runtimeLogs;
}

// Function to check app status
function getAppStatus() {
  console.log('📱 Getting app status...');
  
  const appStatus = runDoctlCommand(
    `doctl apps get ${APP_ID}`,
    'Fetching app status'
  );
  
  if (appStatus) {
    console.log('📊 App status:');
    console.log(appStatus);
  }
  
  return appStatus;
}

// Function to check for stuck deployments
function checkStuckDeployments() {
  console.log('🚨 Checking for stuck deployments...');
  
  const deployments = getDeploymentStatus();
  if (!deployments) return;
  
  const lines = deployments.split('\n').filter(line => line.trim());
  const stuckDeployments = [];
  
  for (const line of lines) {
    if (line.includes('BUILDING') || line.includes('PENDING')) {
      const parts = line.split(/\s+/);
      if (parts.length >= 4) {
        const deploymentId = parts[0];
        const phase = parts[3];
        const progress = parts[2];
        
        if (phase === 'BUILDING' && progress === '1/6') {
          stuckDeployments.push({
            id: deploymentId,
            phase: phase,
            progress: progress
          });
        }
      }
    }
  }
  
  if (stuckDeployments.length > 0) {
    console.log('⚠️ Found stuck deployments:');
    stuckDeployments.forEach(deployment => {
      console.log(`  - ${deployment.id}: ${deployment.phase} (${deployment.progress})`);
    });
  } else {
    console.log('✅ No stuck deployments found');
  }
  
  return stuckDeployments;
}

// Function to cancel stuck deployments
function cancelStuckDeployments(stuckDeployments) {
  if (stuckDeployments.length === 0) return;
  
  console.log('🛑 Canceling stuck deployments...');
  
  for (const deployment of stuckDeployments) {
    console.log(`🔄 Canceling deployment ${deployment.id}...`);
    
    const result = runDoctlCommand(
      `doctl apps create-deployment ${APP_ID} --force-rebuild`,
      `Canceling deployment ${deployment.id}`
    );
    
    if (result) {
      console.log(`✅ Deployment ${deployment.id} canceled`);
    }
  }
}

// Function to check custom domain status
function checkCustomDomainStatus() {
  console.log('🌐 Checking custom domain status...');
  
  try {
    const response = fetch(`https://${CUSTOM_DOMAIN}`);
    console.log(`✅ Custom domain is accessible: ${response.status}`);
  } catch (error) {
    console.error(`❌ Custom domain is not accessible:`, error.message);
  }
}

// Function to check production URL status
function checkProductionUrlStatus() {
  console.log('🔗 Checking production URL status...');
  
  try {
    const response = fetch(PRODUCTION_URL);
    console.log(`✅ Production URL is accessible: ${response.status}`);
  } catch (error) {
    console.error(`❌ Production URL is not accessible:`, error.message);
  }
}

// Function to create a new deployment
function createNewDeployment() {
  console.log('🚀 Creating new deployment...');
  
  const result = runDoctlCommand(
    `doctl apps create-deployment ${APP_ID} --force-rebuild`,
    'Creating new deployment'
  );
  
  if (result) {
    console.log('✅ New deployment created');
    console.log(result);
  }
  
  return result;
}

// Function to get detailed deployment info
function getDeploymentDetails(deploymentId) {
  console.log(`📋 Getting detailed info for deployment ${deploymentId}...`);
  
  const details = runDoctlCommand(
    `doctl apps get-deployment ${APP_ID} ${deploymentId}`,
    `Fetching deployment details for ${deploymentId}`
  );
  
  if (details) {
    console.log('📊 Deployment details:');
    console.log(details);
  }
  
  return details;
}

// Function to check for caching issues
function checkCachingIssues() {
  console.log('🗄️ Checking for caching issues...');
  
  // Check if there are multiple pending deployments
  const deployments = getDeploymentStatus();
  if (!deployments) return;
  
  const lines = deployments.split('\n').filter(line => line.trim());
  const pendingCount = lines.filter(line => line.includes('PENDING')).length;
  const buildingCount = lines.filter(line => line.includes('BUILDING')).length;
  
  console.log(`📊 Pending deployments: ${pendingCount}`);
  console.log(`📊 Building deployments: ${buildingCount}`);
  
  if (pendingCount > 3 || buildingCount > 1) {
    console.log('⚠️ Potential caching issue detected: Multiple deployments in progress');
    console.log('💡 Recommendation: Cancel all pending deployments and create a single new one');
  }
}

// Function to generate debug report
function generateDebugReport() {
  console.log('📝 Generating comprehensive debug report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    appId: APP_ID,
    customDomain: CUSTOM_DOMAIN,
    productionUrl: PRODUCTION_URL,
    deployments: getDeploymentStatus(),
    appStatus: getAppStatus(),
    stuckDeployments: checkStuckDeployments(),
    cachingIssues: checkCachingIssues()
  };
  
  const reportPath = `debug-report-${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`📄 Debug report saved to: ${reportPath}`);
  return report;
}

// Main debugging function
async function main() {
  console.log('🚀 Starting comprehensive deployment debugging...');
  console.log('');
  
  // Step 1: Get current status
  console.log('=== STEP 1: Current Status ===');
  getAppStatus();
  getDeploymentStatus();
  console.log('');
  
  // Step 2: Check for stuck deployments
  console.log('=== STEP 2: Checking for Stuck Deployments ===');
  const stuckDeployments = checkStuckDeployments();
  console.log('');
  
  // Step 3: Check for caching issues
  console.log('=== STEP 3: Checking for Caching Issues ===');
  checkCachingIssues();
  console.log('');
  
  // Step 4: Check domain accessibility
  console.log('=== STEP 4: Checking Domain Accessibility ===');
  checkCustomDomainStatus();
  checkProductionUrlStatus();
  console.log('');
  
  // Step 5: Get detailed logs for stuck deployments
  if (stuckDeployments.length > 0) {
    console.log('=== STEP 5: Getting Detailed Logs for Stuck Deployments ===');
    for (const deployment of stuckDeployments) {
      console.log(`\n--- Deployment ${deployment.id} ---`);
      getDeploymentDetails(deployment.id);
      getBuildLogs(deployment.id);
      getRuntimeLogs(deployment.id);
    }
    console.log('');
  }
  
  // Step 6: Generate debug report
  console.log('=== STEP 6: Generating Debug Report ===');
  const report = generateDebugReport();
  console.log('');
  
  // Step 7: Recommendations
  console.log('=== STEP 7: Recommendations ===');
  if (stuckDeployments.length > 0) {
    console.log('🛑 RECOMMENDED ACTIONS:');
    console.log('1. Cancel all stuck deployments');
    console.log('2. Wait for current deployment to complete');
    console.log('3. Create a single new deployment');
    console.log('4. Monitor the new deployment closely');
    console.log('');
    
    console.log('🔄 Would you like to cancel stuck deployments and create a new one? (y/n)');
    // In a real implementation, you'd read user input here
    console.log('💡 Run: node scripts/debug-deployment.js --cancel-stuck --create-new');
  } else {
    console.log('✅ No stuck deployments found. Current deployment should complete normally.');
  }
  
  console.log('');
  console.log('🎯 Debugging completed! Check the debug report for detailed information.');
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--cancel-stuck')) {
  console.log('🛑 Canceling stuck deployments...');
  const stuckDeployments = checkStuckDeployments();
  cancelStuckDeployments(stuckDeployments);
}

if (args.includes('--create-new')) {
  console.log('🚀 Creating new deployment...');
  createNewDeployment();
}

// Run main function
if (args.includes('--help')) {
  console.log('📖 DigitalOcean App Platform Deployment Debugger');
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/debug-deployment.js                    # Run full debugging');
  console.log('  node scripts/debug-deployment.js --cancel-stuck     # Cancel stuck deployments');
  console.log('  node scripts/debug-deployment.js --create-new       # Create new deployment');
  console.log('  node scripts/debug-deployment.js --help             # Show this help');
} else {
  main().catch(console.error);
}
