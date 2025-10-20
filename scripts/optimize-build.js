#!/usr/bin/env node

/**
 * Build Optimization Script for DigitalOcean Deployment
 * Handles common build issues and optimizes for production
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting build optimization...');

// Configuration
const config = {
  maxRetries: 3,
  buildTimeout: 1800000, // 30 minutes
  memoryLimit: '512m',
  nodeOptions: '--max-old-space-size=512'
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function execCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      timeout: config.buildTimeout,
      ...options 
    });
    return result.trim();
  } catch (error) {
    log(`Command failed: ${command}`, 'error');
    log(`Error: ${error.message}`, 'error');
    throw error;
  }
}

// Build optimization steps
async function optimizeBuild() {
  try {
    // Step 1: Environment setup
    log('Setting up build environment...');
    process.env.NODE_OPTIONS = config.nodeOptions;
    process.env.NODE_ENV = 'production';
    process.env.BUILD_OPTIMIZATION = 'true';

    // Step 2: Clean workspace
    log('Cleaning workspace...');
    const cleanPaths = ['dist', '.astro', 'node_modules/.cache', '.next'];
    cleanPaths.forEach(cleanPath => {
      if (fs.existsSync(cleanPath)) {
        execCommand(`rm -rf ${cleanPath}`);
        log(`Cleaned ${cleanPath}`);
      }
    });

    // Remove conflicting lockfiles
    const lockFiles = ['package-lock.json', 'yarn.lock', 'npm-shrinkwrap.json'];
    lockFiles.forEach(lockFile => {
      if (fs.existsSync(lockFile)) {
        fs.unlinkSync(lockFile);
        log(`Removed ${lockFile}`);
      }
    });

    // Step 3: Validate package.json
    log('Validating package.json...');
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    if (!packageJson.scripts?.build) {
      throw new Error('Build script not found in package.json');
    }
    
    if (!packageJson.scripts?.start) {
      throw new Error('Start script not found in package.json');
    }

    // Step 4: Install dependencies with optimization
    log('Installing dependencies...');
    execCommand('pnpm install --frozen-lockfile --prefer-offline');

    // Step 5: Pre-build validation
    log('Running pre-build validation...');
    
    // Type check
    try {
      execCommand('pnpm run type-check');
      log('Type check passed');
    } catch (error) {
      log('Type check failed, but continuing...', 'warning');
    }

    // Lint check
    try {
      execCommand('pnpm run lint');
      log('Lint check passed');
    } catch (error) {
      log('Lint check failed, but continuing...', 'warning');
    }

    // Step 6: Build with retries
    log('Building application...');
    let buildSuccess = false;
    let lastError = null;

    for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
      try {
        log(`Build attempt ${attempt}/${config.maxRetries}...`);
        execCommand('pnpm run build');
        buildSuccess = true;
        log('Build completed successfully');
        break;
      } catch (error) {
        lastError = error;
        log(`Build attempt ${attempt} failed: ${error.message}`, 'warning');
        
        if (attempt < config.maxRetries) {
          log('Retrying build...');
          // Clean and retry
          if (fs.existsSync('dist')) {
            execCommand('rm -rf dist');
          }
          if (fs.existsSync('.astro')) {
            execCommand('rm -rf .astro');
          }
        }
      }
    }

    if (!buildSuccess) {
      throw new Error(`Build failed after ${config.maxRetries} attempts: ${lastError?.message}`);
    }

    // Step 7: Post-build validation
    log('Validating build output...');
    
    if (!fs.existsSync('dist')) {
      throw new Error('Build output directory not found');
    }

    if (!fs.existsSync('dist/server/entry.mjs')) {
      throw new Error('Server entry point not found');
    }

    // Check build size
    const distSize = execCommand('du -sh dist | cut -f1');
    log(`Build size: ${distSize}`);

    // Step 8: Generate build report
    log('Generating build report...');
    const buildReport = {
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      buildSize: distSize,
      files: getBuildFiles('dist'),
      success: true
    };

    fs.writeFileSync('build-report.json', JSON.stringify(buildReport, null, 2));
    log('Build report generated');

    // Step 9: Optimize for production
    log('Optimizing for production...');
    
    // Set production environment variables
    const envContent = `
# Production Environment Variables
NODE_ENV=production
HOST=0.0.0.0
PORT=8080
BUILD_OPTIMIZATION=true
`;
    
    fs.writeFileSync('.env.production', envContent);
    log('Production environment file created');

    log('Build optimization completed successfully!');
    return true;

  } catch (error) {
    log(`Build optimization failed: ${error.message}`, 'error');
    
    // Generate error report
    const errorReport = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      success: false
    };
    
    fs.writeFileSync('build-error.json', JSON.stringify(errorReport, null, 2));
    throw error;
  }
}

// Helper function to get build files
function getBuildFiles(dir) {
  const files = [];
  
  function scanDir(currentDir, relativePath = '') {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const relativeItemPath = path.join(relativePath, item);
      
      if (fs.statSync(fullPath).isDirectory()) {
        scanDir(fullPath, relativeItemPath);
      } else {
        const stats = fs.statSync(fullPath);
        files.push({
          path: relativeItemPath,
          size: stats.size,
          modified: stats.mtime
        });
      }
    });
  }
  
  scanDir(dir);
  return files;
}

// Run optimization
if (import.meta.url === `file://${process.argv[1]}`) {
  optimizeBuild()
    .then(() => {
      log('Build optimization completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      log(`Build optimization failed: ${error.message}`, 'error');
      process.exit(1);
    });
}

export { optimizeBuild };
