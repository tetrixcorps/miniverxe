#!/usr/bin/env node

/**
 * Force Fresh Build Script for DigitalOcean App Platform
 * This script modifies the build configuration to disable caching
 * and force a completely fresh build every time.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 [FORCE-FRESH-BUILD] Starting fresh build configuration...');

// Create a .buildpacks file to control buildpack behavior
const buildpacksContent = `# Force fresh build by disabling cache
# This file forces DigitalOcean to use a fresh build every time

# Disable node_modules cache
NODE_MODULES_CACHE=false

# Disable build cache
BUILD_CACHE=false

# Force clean install
CLEAN_INSTALL=true

# Disable layer caching
DISABLE_LAYER_CACHE=true

# Force rebuild all layers
FORCE_REBUILD=true
`;

const buildpacksPath = path.join(__dirname, '..', '.buildpacks');
fs.writeFileSync(buildpacksPath, buildpacksContent);
console.log('✅ [FORCE-FRESH-BUILD] Created .buildpacks file');

// Create a .env file with build environment variables
const envContent = `# Force fresh build environment variables
NODE_MODULES_CACHE=false
BUILD_CACHE=false
CLEAN_INSTALL=true
DISABLE_LAYER_CACHE=true
FORCE_REBUILD=true
BUILD_OPTIMIZATION=true
`;

const envPath = path.join(__dirname, '..', '.env.build');
fs.writeFileSync(envPath, envContent);
console.log('✅ [FORCE-FRESH-BUILD] Created .env.build file');

// Modify package.json to include build cache clearing
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Add build script that clears cache
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }
  
  packageJson.scripts['build:fresh'] = 'rm -rf dist .astro node_modules/.cache && pnpm run build';
  packageJson.scripts['build:force'] = 'rm -rf dist .astro node_modules/.cache .pnpm-store && pnpm install --frozen-lockfile=false && pnpm run build';
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ [FORCE-FRESH-BUILD] Updated package.json with fresh build scripts');
}

// Create a build script that clears all caches
const buildScript = `#!/bin/bash
# Force fresh build script for DigitalOcean App Platform

echo "🧹 [FORCE-FRESH-BUILD] Clearing all caches and build artifacts..."

# Clear all possible cache directories
rm -rf dist
rm -rf .astro
rm -rf node_modules/.cache
rm -rf .pnpm-store
rm -rf .next
rm -rf .nuxt
rm -rf .vuepress/dist
rm -rf .vitepress/cache
rm -rf .vite
rm -rf .turbo

# Clear pnpm cache
pnpm store prune

# Clear npm cache
npm cache clean --force

# Clear yarn cache
yarn cache clean

echo "✅ [FORCE-FRESH-BUILD] All caches cleared"

# Force fresh install
echo "📦 [FORCE-FRESH-BUILD] Installing dependencies..."
pnpm install --frozen-lockfile=false

# Build with fresh environment
echo "🏗️ [FORCE-FRESH-BUILD] Building application..."
pnpm run build

echo "✅ [FORCE-FRESH-BUILD] Fresh build completed"
`;

const buildScriptPath = path.join(__dirname, 'force-fresh-build.sh');
fs.writeFileSync(buildScriptPath, buildScript);
fs.chmodSync(buildScriptPath, '755');
console.log('✅ [FORCE-FRESH-BUILD] Created force-fresh-build.sh script');

// Create a .dockerignore to prevent cache issues
const dockerignoreContent = `# Ignore cache directories
node_modules/.cache
.pnpm-store
.astro
dist
.next
.nuxt
.vuepress/dist
.vitepress/cache
.vite
.turbo

# Ignore build artifacts
*.log
*.tmp
*.temp

# Ignore environment files
.env.local
.env.development.local
.env.test.local
.env.production.local
`;

const dockerignorePath = path.join(__dirname, '..', '.dockerignore');
fs.writeFileSync(dockerignorePath, dockerignoreContent);
console.log('✅ [FORCE-FRESH-BUILD] Created .dockerignore file');

console.log('🎉 [FORCE-FRESH-BUILD] Fresh build configuration completed!');
console.log('📝 [FORCE-FRESH-BUILD] Next steps:');
console.log('   1. Commit these changes');
console.log('   2. Push to trigger a new deployment');
console.log('   3. The build should now be completely fresh');
