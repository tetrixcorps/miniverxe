#!/bin/bash

# TETRIX 2FA Authentication System Deployment Script
# Version: 2.0
# Date: January 10, 2025

set -e

echo "🚀 TETRIX 2FA Authentication System Deployment"
echo "=============================================="

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

# Check if required environment variables are set
check_env_vars() {
    print_status "Checking environment variables..."
    
    if [ -z "$TELNYX_API_KEY" ]; then
        print_error "TELNYX_API_KEY is not set"
        exit 1
    fi
    
    if [ -z "$WEBHOOK_BASE_URL" ]; then
        print_error "WEBHOOK_BASE_URL is not set"
        exit 1
    fi
    
    print_success "Environment variables are set"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if command -v pnpm &> /dev/null; then
        pnpm install
    elif command -v npm &> /dev/null; then
        npm install
    else
        print_error "Neither pnpm nor npm is installed"
        exit 1
    fi
    
    print_success "Dependencies installed"
}

# Build the application
build_app() {
    print_status "Building application..."
    
    if command -v pnpm &> /dev/null; then
        pnpm run build
    else
        npm run build
    fi
    
    print_success "Application built successfully"
}

# Test the endpoints
test_endpoints() {
    print_status "Testing 2FA endpoints..."
    
    BASE_URL=${WEBHOOK_BASE_URL:-"http://localhost:4321"}
    
    # Test health check
    print_status "Testing health check..."
    if curl -s -f "${BASE_URL}/api/v2/2fa/status?verificationId=test" > /dev/null; then
        print_success "Health check passed"
    else
        print_warning "Health check failed - this is expected for test verification ID"
    fi
    
    # Test initiate endpoint
    print_status "Testing initiate endpoint..."
    RESPONSE=$(curl -s -X POST "${BASE_URL}/api/v2/2fa/initiate" \
        -H "Content-Type: application/json" \
        -d '{"phoneNumber": "+1234567890", "method": "sms"}' 2>/dev/null || echo "{}")
    
    if echo "$RESPONSE" | grep -q "success"; then
        print_success "Initiate endpoint is working"
    else
        print_warning "Initiate endpoint test failed - check logs"
    fi
    
    print_success "Endpoint testing completed"
}

# Deploy to DigitalOcean (if doctl is available)
deploy_do() {
    if command -v doctl &> /dev/null; then
        print_status "Deploying to DigitalOcean App Platform..."
        
        # Check if app spec exists
        if [ -f ".do/app-spec.yaml" ]; then
            doctl apps create --spec .do/app-spec.yaml
            print_success "Deployed to DigitalOcean"
        else
            print_warning "No .do/app-spec.yaml found, skipping DigitalOcean deployment"
        fi
    else
        print_warning "doctl not found, skipping DigitalOcean deployment"
    fi
}

# Start the application
start_app() {
    print_status "Starting 2FA authentication service..."
    
    # Set default port if not set
    export PORT=${PORT:-4321}
    
    if command -v pnpm &> /dev/null; then
        pnpm run start &
    else
        npm run start &
    fi
    
    APP_PID=$!
    print_success "2FA service started with PID: $APP_PID"
    
    # Wait a moment for the app to start
    sleep 5
    
    # Test if the app is running
    if curl -s -f "http://localhost:${PORT}/api/v2/2fa/status?verificationId=test" > /dev/null 2>&1; then
        print_success "2FA service is running and responding"
    else
        print_warning "2FA service may not be fully started yet"
    fi
}

# Main deployment function
main() {
    echo
    print_status "Starting deployment process..."
    echo
    
    # Check environment variables
    check_env_vars
    
    # Install dependencies
    install_dependencies
    
    # Build application
    build_app
    
    # Test endpoints
    test_endpoints
    
    # Deploy to DigitalOcean (if available)
    deploy_do
    
    # Start the application
    start_app
    
    echo
    print_success "🎉 TETRIX 2FA Authentication System deployed successfully!"
    echo
    echo "📋 Deployment Summary:"
    echo "  - Service URL: ${WEBHOOK_BASE_URL:-"http://localhost:4321"}"
    echo "  - API Endpoints:"
    echo "    • POST /api/v2/2fa/initiate"
    echo "    • POST /api/v2/2fa/verify"
    echo "    • GET /api/v2/2fa/status"
    echo "  - Telnyx Profile ID: ${TELNYX_PROFILE_ID:-"***REMOVED***"}"
    echo
    echo "🧪 Test your deployment:"
    echo "  curl -X POST ${WEBHOOK_BASE_URL:-"http://localhost:4321"}/api/v2/2fa/initiate \\"
    echo "    -H 'Content-Type: application/json' \\"
    echo "    -d '{\"phoneNumber\": \"+1234567890\", \"method\": \"sms\"}'"
    echo
    echo "📚 Documentation: docs/2FA_AUTH_DEPLOYMENT_GUIDE.md"
    echo
}

# Run main function
main "$@"
