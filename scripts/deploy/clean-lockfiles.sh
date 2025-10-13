#!/bin/bash

# Clean lockfiles script for Digital Ocean deployment
# This script removes conflicting lockfiles before buildpack detection

echo "🧹 Cleaning up conflicting lockfiles for Digital Ocean deployment..."

# Remove all conflicting lockfiles
rm -f package-lock.json
rm -f yarn.lock
rm -f npm-shrinkwrap.json
rm -f .yarnrc
rm -f .yarnrc.yml

# Ensure only pnpm-lock.yaml exists
if [ ! -f "pnpm-lock.yaml" ]; then
    echo "❌ pnpm-lock.yaml not found!"
    exit 1
fi

echo "✅ Lockfiles cleaned successfully"
echo "📦 Only pnpm-lock.yaml remains"

# Verify no conflicting lockfiles exist
conflicting_files=$(find . -maxdepth 1 -name "package-lock.json" -o -name "yarn.lock" -o -name "npm-shrinkwrap.json" -o -name ".yarnrc" -o -name ".yarnrc.yml" 2>/dev/null)

if [ -n "$conflicting_files" ]; then
    echo "❌ Still found conflicting lockfiles:"
    echo "$conflicting_files"
    exit 1
else
    echo "✅ No conflicting lockfiles found"
fi

echo "🚀 Ready for pnpm build process"
