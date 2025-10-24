#!/bin/bash

# TETRIX Docker Build Script with Network Fallbacks
# This script tries multiple approaches to handle network issues

set -e

echo "🚀 Starting TETRIX Docker build with network fallbacks..."

# Function to try building with different configurations
try_build() {
    local config_name="$1"
    local dockerfile_args="$2"
    
    echo "📦 Trying build configuration: $config_name"
    
    if docker-compose -f docker-compose.digitalocean.yml build $dockerfile_args; then
        echo "✅ Build successful with configuration: $config_name"
        return 0
    else
        echo "❌ Build failed with configuration: $config_name"
        return 1
    fi
}

# Clean up any existing containers and images
echo "🧹 Cleaning up existing containers and images..."
docker-compose -f docker-compose.digitalocean.yml down --remove-orphans || true
docker system prune -f || true

# Try different build strategies
echo "🔄 Attempting different build strategies..."

# Strategy 1: Build with registry mirror (already configured in Dockerfile)
if try_build "Registry Mirror" "--no-cache"; then
    echo "🎉 Build completed successfully!"
    exit 0
fi

# Strategy 2: Build without cache and with different network settings
echo "🔄 Trying with different network settings..."
if try_build "No Cache + Network Settings" "--no-cache --build-arg BUILDKIT_INLINE_CACHE=0"; then
    echo "🎉 Build completed successfully!"
    exit 0
fi

# Strategy 3: Build services one by one
echo "🔄 Trying to build services individually..."
services=("tetrix-app" "postgres" "redis" "nginx")

for service in "${services[@]}"; do
    echo "📦 Building service: $service"
    if docker-compose -f docker-compose.digitalocean.yml build --no-cache "$service"; then
        echo "✅ Service $service built successfully"
    else
        echo "❌ Service $service failed to build"
        # Continue with other services
    fi
done

# Strategy 4: Try building with different base images
echo "🔄 Trying with different base image configuration..."
if try_build "Different Base Image" "--no-cache --build-arg NODE_VERSION=20-alpine"; then
    echo "🎉 Build completed successfully!"
    exit 0
fi

echo "❌ All build strategies failed. Please check your network connection and try again."
echo "💡 Suggestions:"
echo "   - Check your internet connection"
echo "   - Try using a VPN or different network"
echo "   - Wait for network issues to resolve"
echo "   - Consider using a different registry mirror"

exit 1
