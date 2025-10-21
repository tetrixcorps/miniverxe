#!/bin/bash
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
