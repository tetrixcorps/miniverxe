#!/bin/bash
set -e

echo "🚀 Starting Digital Ocean build process..."

# Clean up any remaining conflicting lockfiles
echo "🧹 Cleaning up conflicting lockfiles..."
rm -f package-lock.json yarn.lock npm-shrinkwrap.json .yarnrc .yarnrc.yml 2>/dev/null || true

# Install pnpm globally
echo "📦 Installing pnpm..."
npm install -g pnpm@10.8.0

# Install dependencies with pnpm
echo "📦 Installing dependencies with pnpm..."
pnpm install --frozen-lockfile

# Build the application
echo "🔨 Building application..."
pnpm run build

echo "✅ Build completed successfully!"
