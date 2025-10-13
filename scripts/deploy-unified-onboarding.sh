#!/bin/bash
set -e

echo "🚀 Deploying Unified Onboarding System to Digital Ocean..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if doctl is installed and authenticated
check_doctl() {
    print_status "Checking doctl authentication..."
    if ! command -v doctl &> /dev/null; then
        print_error "doctl is not installed. Please install it first."
        exit 1
    fi
    
    if ! doctl auth list &> /dev/null; then
        print_error "doctl is not authenticated. Please run 'doctl auth init' first."
        exit 1
    fi
    
    print_success "doctl is authenticated"
}

# Clean up any conflicting lockfiles
cleanup_lockfiles() {
    print_status "Cleaning up conflicting lockfiles..."
    
    # Remove any package-lock.json files
    find . -name "package-lock.json" -not -path "./node_modules/*" -delete 2>/dev/null || true
    
    # Remove any yarn.lock files (except in node_modules)
    find . -name "yarn.lock" -not -path "./node_modules/*" -delete 2>/dev/null || true
    
    # Remove any .yarnrc files
    find . -name ".yarnrc*" -not -path "./node_modules/*" -delete 2>/dev/null || true
    
    print_success "Lockfiles cleaned up"
}

# Verify pnpm lockfile exists
verify_pnpm_lockfile() {
    print_status "Verifying pnpm lockfile..."
    
    if [ ! -f "pnpm-lock.yaml" ]; then
        print_error "pnpm-lock.yaml not found. Please run 'pnpm install' first."
        exit 1
    fi
    
    print_success "pnpm-lock.yaml found"
}

# Test the build locally
test_build() {
    print_status "Testing build locally..."
    
    # Install dependencies
    pnpm install --frozen-lockfile
    
    # Build the application
    pnpm run build
    
    print_success "Local build successful"
}

# Deploy to Digital Ocean
deploy_to_do() {
    print_status "Deploying to Digital Ocean..."
    
    # Check if app exists
    APP_ID="a6c09832-9957-4962-a352-b9d909680452"
    
    if doctl apps get $APP_ID &> /dev/null; then
        print_status "Updating existing app..."
        
        # Update the app
        doctl apps update $APP_ID --spec .do/app-shango-integration.yaml
        
        print_success "App updated successfully"
    else
        print_error "App not found. Please create the app first."
        exit 1
    fi
}

# Monitor deployment
monitor_deployment() {
    print_status "Monitoring deployment..."
    
    APP_ID="a6c09832-9957-4962-a352-b9d909680452"
    
    # Get the latest deployment
    DEPLOYMENT_ID=$(doctl apps list-deployments $APP_ID --format ID --no-header | head -1)
    
    if [ -z "$DEPLOYMENT_ID" ]; then
        print_error "No deployments found"
        exit 1
    fi
    
    print_status "Monitoring deployment: $DEPLOYMENT_ID"
    
    # Monitor build logs
    doctl apps logs $APP_ID --deployment $DEPLOYMENT_ID --type build --follow
}

# Check deployment status
check_deployment_status() {
    print_status "Checking deployment status..."
    
    APP_ID="a6c09832-9957-4962-a352-b9d909680452"
    
    # Get app status
    doctl apps get $APP_ID --format "Name,DefaultIngress,ActiveDeployment"
    
    # Get deployment logs
    DEPLOYMENT_ID=$(doctl apps list-deployments $APP_ID --format ID --no-header | head -1)
    
    if [ ! -z "$DEPLOYMENT_ID" ]; then
        print_status "Latest deployment logs:"
        doctl apps logs $APP_ID --deployment $DEPLOYMENT_ID --type run --tail 20
    fi
}

# Main deployment function
main() {
    echo "🎯 Starting Unified Onboarding System Deployment"
    echo "=================================================="
    
    # Step 1: Check prerequisites
    check_doctl
    
    # Step 2: Clean up lockfiles
    cleanup_lockfiles
    
    # Step 3: Verify pnpm lockfile
    verify_pnpm_lockfile
    
    # Step 4: Test build locally
    test_build
    
    # Step 5: Deploy to Digital Ocean
    deploy_to_do
    
    # Step 6: Monitor deployment
    print_status "Deployment initiated. Monitoring progress..."
    monitor_deployment
    
    # Step 7: Check final status
    check_deployment_status
    
    print_success "Deployment completed!"
    print_status "Your unified onboarding system is now live!"
}

# Run main function
main "$@"
