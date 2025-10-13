#!/bin/bash
set -e

echo "🧹 Cleaning up all conflicting lockfiles..."

# Remove all conflicting lockfiles from the entire project
echo "Removing package-lock.json files..."
find . -name "package-lock.json" -not -path "./node_modules/*" -not -path "./.git/*" -delete

echo "Removing yarn.lock files..."
find . -name "yarn.lock" -not -path "./node_modules/*" -not -path "./.git/*" -delete

echo "Removing npm-shrinkwrap.json files..."
find . -name "npm-shrinkwrap.json" -not -path "./node_modules/*" -not -path "./.git/*" -delete

echo "Removing .yarnrc files..."
find . -name ".yarnrc" -not -path "./node_modules/*" -not -path "./.git/*" -delete

echo "Removing .yarnrc.yml files..."
find . -name ".yarnrc.yml" -not -path "./node_modules/*" -not -path "./.git/*" -delete

# Clean all node_modules directories
echo "Cleaning node_modules directories..."
rm -rf node_modules/
rm -rf services/*/node_modules/
rm -rf apps/*/node_modules/
rm -rf external/*/node_modules/
rm -rf cursor-talk-to-figma-mcp/node_modules/

# Reinstall with pnpm only
echo "Installing dependencies with pnpm..."
pnpm install

echo "✅ Cleanup complete! Only pnpm-lock.yaml should exist now."

# Verify the cleanup
echo "🔍 Verifying lockfiles..."
LOCKFILES=$(find . -name "*lock*" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./cursor-talk-to-figma-mcp/*" -not -path "./external/mcp/*" | grep -v "block-navigation.js" | grep -v "TestClocks" | grep -v "flake.lock" | grep -v "deno.lock" | wc -l)

if [ "$LOCKFILES" -eq 1 ]; then
    echo "✅ Success! Only pnpm-lock.yaml found."
    find . -name "*lock*" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./cursor-talk-to-figma-mcp/*" -not -path "./external/mcp/*" | grep -v "block-navigation.js" | grep -v "TestClocks" | grep -v "flake.lock" | grep -v "deno.lock"
else
    echo "❌ Still found $LOCKFILES lockfiles:"
    find . -name "*lock*" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./cursor-talk-to-figma-mcp/*" -not -path "./external/mcp/*" | grep -v "block-navigation.js" | grep -v "TestClocks" | grep -v "flake.lock" | grep -v "deno.lock"
    exit 1
fi
