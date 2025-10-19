#!/bin/bash

# TETRIX 2FA Authentication System - DigitalOcean Deployment Script
# Uses doctl to deploy to DigitalOcean App Platform

set -e

echo "🚀 TETRIX 2FA Authentication System - DigitalOcean Deployment"
echo "============================================================="

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

# Check if doctl is installed
check_doctl() {
    print_status "Checking doctl installation..."
    
    if ! command -v doctl &> /dev/null; then
        print_error "doctl is not installed. Please install it first:"
        echo "  curl -sL https://github.com/digitalocean/doctl/releases/download/v1.146.0/doctl-1.146.0-linux-amd64.tar.gz | tar -xzv"
        echo "  sudo mv doctl /usr/local/bin"
        exit 1
    fi
    
    print_success "doctl is installed"
}

# Check authentication
check_auth() {
    print_status "Checking DigitalOcean authentication..."
    
    if ! doctl account get &> /dev/null; then
        print_error "Not authenticated with DigitalOcean. Please run:"
        echo "  doctl auth init"
        exit 1
    fi
    
    print_success "Authenticated with DigitalOcean"
}

# Get environment variables
get_env_vars() {
    print_status "Getting environment variables..."
    
    # Check if .env file exists
    if [ -f ".env" ]; then
        print_status "Loading environment variables from .env file..."
        source .env
    else
        print_warning "No .env file found. Using default values."
    fi
    
    # Set default values if not provided
    TELNYX_API_KEY=${TELNYX_API_KEY:-"your_telnyx_api_key_here"}
    WEBHOOK_BASE_URL=${WEBHOOK_BASE_URL:-"https://tetrix-2fa-auth-xxxxx.ondigitalocean.app"}
    
    print_success "Environment variables loaded"
}

# Update app spec with actual values
update_app_spec() {
    print_status "Updating app specification with environment variables..."
    
    # Create a temporary app spec with actual values
    cat > .do/2fa-auth-app-spec-temp.yaml << EOF
name: tetrix-2fa-auth
services:
- name: tetrix-2fa-api
  source_dir: /
  github:
    repo: tetrixcorps/miniverxe
    branch: main
    deploy_on_push: true
  run_command: pnpm run start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 4321
  routes:
  - path: /api/v2/2fa
  - path: /api/webhooks
  envs:
  # Application Configuration
  - key: NODE_ENV
    value: production
  - key: PORT
    value: "4321"
  - key: HOST
    value: "0.0.0.0"
  
  # Telnyx Configuration
  - key: TELNYX_API_KEY
    value: "${TELNYX_API_KEY}"
  - key: TELNYX_PROFILE_ID
    value: "49000199-7882-f4ce-6514-a67c8190f107"
  - key: TELNYX_API_URL
    value: "https://api.telnyx.com/v2"
  
  # Webhook Configuration
  - key: WEBHOOK_BASE_URL
    value: "${WEBHOOK_BASE_URL}"
  
  # Enhanced Security Features
  - key: FRAUD_DETECTION_ENABLED
    value: "true"
  - key: RATE_LIMITING_ENABLED
    value: "true"
  - key: AUDIT_LOGGING_ENABLED
    value: "true"
  
  # CORS Configuration
  - key: CORS_ORIGIN
    value: "https://tetrixcorp.com,https://joromi.ai,https://poisonedreligion.ai"
  
  # Logging
  - key: LOG_LEVEL
    value: "info"

  health_check:
    http_path: /api/v2/2fa/status?verificationId=health
    initial_delay_seconds: 30
    period_seconds: 15
    timeout_seconds: 10
    success_threshold: 1
    failure_threshold: 3
EOF

    print_success "App specification updated"
}

# Deploy the app
deploy_app() {
    print_status "Deploying 2FA authentication system to DigitalOcean..."
    
    # Check if app already exists
    if doctl apps list | grep -q "tetrix-2fa-auth"; then
        print_warning "App 'tetrix-2fa-auth' already exists. Updating..."
        
        # Get app ID
        APP_ID=$(doctl apps list | grep "tetrix-2fa-auth" | awk '{print $1}')
        
        # Update existing app
        doctl apps update $APP_ID --spec .do/2fa-auth-app-spec-temp.yaml
        print_success "App updated successfully"
    else
        # Create new app
        doctl apps create --spec .do/2fa-auth-app-spec-temp.yaml
        print_success "App created successfully"
    fi
}

# Get app information
get_app_info() {
    print_status "Getting app information..."
    
    # Wait a moment for the app to be created/updated
    sleep 5
    
    # Get app details
    APP_ID=$(doctl apps list | grep "tetrix-2fa-auth" | awk '{print $1}')
    
    if [ -n "$APP_ID" ]; then
        print_success "App ID: $APP_ID"
        
        # Get app URL
        APP_URL=$(doctl apps get $APP_ID --format "DefaultIngress" --no-header)
        if [ -n "$APP_URL" ]; then
            print_success "App URL: $APP_URL"
            echo
            echo "🔗 Your 2FA API endpoints are available at:"
            echo "  • POST $APP_URL/api/v2/2fa/initiate"
            echo "  • POST $APP_URL/api/v2/2fa/verify"
            echo "  • GET  $APP_URL/api/v2/2fa/status"
            echo
        fi
        
        # Get app status
        print_status "App Status:"
        doctl apps get $APP_ID
    else
        print_warning "Could not retrieve app information"
    fi
}

# Test the deployment
test_deployment() {
    print_status "Testing deployment..."
    
    # Get app URL
    APP_ID=$(doctl apps list | grep "tetrix-2fa-auth" | awk '{print $1}')
    if [ -n "$APP_ID" ]; then
        APP_URL=$(doctl apps get $APP_ID --format "DefaultIngress" --no-header)
        
        if [ -n "$APP_URL" ]; then
            print_status "Testing health check endpoint..."
            
            # Test health check
            if curl -s -f "${APP_URL}/api/v2/2fa/status?verificationId=health" > /dev/null 2>&1; then
                print_success "Health check passed"
            else
                print_warning "Health check failed - app may still be starting"
            fi
            
            # Test initiate endpoint
            print_status "Testing initiate endpoint..."
            RESPONSE=$(curl -s -X POST "${APP_URL}/api/v2/2fa/initiate" \
                -H "Content-Type: application/json" \
                -d '{"phoneNumber": "+1234567890", "method": "sms"}' 2>/dev/null || echo "{}")
            
            if echo "$RESPONSE" | grep -q "success\|error"; then
                print_success "Initiate endpoint is responding"
            else
                print_warning "Initiate endpoint test failed - check app logs"
            fi
        fi
    fi
}

# Clean up temporary files
cleanup() {
    print_status "Cleaning up temporary files..."
    rm -f .do/2fa-auth-app-spec-temp.yaml
    print_success "Cleanup completed"
}

# Main deployment function
main() {
    echo
    print_status "Starting DigitalOcean deployment process..."
    echo
    
    # Pre-deployment checks
    check_doctl
    check_auth
    get_env_vars
    
    # Deploy
    update_app_spec
    deploy_app
    get_app_info
    test_deployment
    cleanup
    
    echo
    print_success "🎉 TETRIX 2FA Authentication System deployed to DigitalOcean!"
    echo
    echo "📋 Next Steps:"
    echo "  1. Update your Telnyx webhook URL to point to the new app URL"
    echo "  2. Test the endpoints using the provided test script"
    echo "  3. Monitor the app in the DigitalOcean dashboard"
    echo
    echo "🧪 Test your deployment:"
    echo "  node scripts/test-2fa-endpoints.js"
    echo
    echo "📚 Documentation: docs/2FA_AUTH_DEPLOYMENT_GUIDE.md"
    echo
}

# Run main function
main "$@"
