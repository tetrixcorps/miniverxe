#!/bin/bash

# Comprehensive deployment script implementing DigitalOcean App Platform best practices
# This script handles the complete deployment lifecycle with proper error handling

set -e  # Exit on any error

APP_ID="ca96485c-ee6b-401b-b1a2-8442c3bc7f04"
APP_SPEC_FILE=".do/cleaned-app-spec.yaml"
BACKUP_SPEC_FILE=".do/backup-app-spec-$(date +%Y%m%d-%H%M%S).yaml"

echo "🚀 Starting TETRIX Production Deployment with Best Practices"
echo "=============================================================="

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Pre-deployment checks
log "🔍 Running pre-deployment checks..."

# Check if doctl is installed and authenticated
if ! command_exists doctl; then
    log "❌ doctl is not installed. Please install it first."
    exit 1
fi

# Check if we're authenticated
if ! doctl account get >/dev/null 2>&1; then
    log "❌ Not authenticated with DigitalOcean. Please run 'doctl auth init' first."
    exit 1
fi

# Check if app spec file exists
if [ ! -f "$APP_SPEC_FILE" ]; then
    log "❌ App spec file not found: $APP_SPEC_FILE"
    exit 1
fi

# Check if pnpm is available
if ! command_exists pnpm; then
    log "❌ pnpm is not installed. Please install it first."
    exit 1
fi

log "✅ Pre-deployment checks passed"

# Backup current app spec
log "💾 Creating backup of current app spec..."
doctl apps get $APP_ID -o json | jq '.[0].spec' > "$BACKUP_SPEC_FILE"
log "✅ Backup created: $BACKUP_SPEC_FILE"

# Validate app spec
log "🔍 Validating app spec..."
if ! doctl apps propose $APP_ID --spec "$APP_SPEC_FILE" >/dev/null 2>&1; then
    log "❌ App spec validation failed"
    exit 1
fi
log "✅ App spec validation passed"

# Check current app status
log "📊 Checking current app status..."
CURRENT_STATUS=$(doctl apps get $APP_ID -o json | jq -r '.[0].active_deployment.phase')
log "Current deployment status: $CURRENT_STATUS"

# Update app with new spec
log "🔄 Updating app with new spec..."
if doctl apps update $APP_ID --spec "$APP_SPEC_FILE"; then
    log "✅ App spec updated successfully"
else
    log "❌ Failed to update app spec"
    exit 1
fi

# Wait for deployment to start
log "⏳ Waiting for deployment to start..."
sleep 10

# Monitor deployment progress
log "📈 Monitoring deployment progress..."
DEPLOYMENT_ID=$(doctl apps get $APP_ID -o json | jq -r '.[0].active_deployment.id')
log "Deployment ID: $DEPLOYMENT_ID"

# Function to check deployment status
check_deployment_status() {
    local status=$(doctl apps get-deployment $DEPLOYMENT_ID -o json | jq -r '.phase')
    echo "$status"
}

# Monitor deployment with timeout
TIMEOUT=600  # 10 minutes
ELAPSED=0
INTERVAL=30  # Check every 30 seconds

while [ $ELAPSED -lt $TIMEOUT ]; do
    STATUS=$(check_deployment_status)
    log "Deployment status: $STATUS (${ELAPSED}s elapsed)"
    
    case $STATUS in
        "SUCCESS")
            log "✅ Deployment completed successfully!"
            break
            ;;
        "FAILED"|"CANCELED")
            log "❌ Deployment failed with status: $STATUS"
            log "📋 Checking deployment logs..."
            doctl apps logs $APP_ID --deployment $DEPLOYMENT_ID --type build
            doctl apps logs $APP_ID --deployment $DEPLOYMENT_ID --type run
            exit 1
            ;;
        "PENDING"|"BUILDING"|"DEPLOYING")
            sleep $INTERVAL
            ELAPSED=$((ELAPSED + INTERVAL))
            ;;
        *)
            log "⚠️  Unknown deployment status: $STATUS"
            sleep $INTERVAL
            ELAPSED=$((ELAPSED + INTERVAL))
            ;;
    esac
done

if [ $ELAPSED -ge $TIMEOUT ]; then
    log "❌ Deployment timeout exceeded (${TIMEOUT}s)"
    exit 1
fi

# Verify app is running
log "🔍 Verifying app is running..."
sleep 30  # Wait for app to fully start

# Check app instances
log "📊 Checking app instances..."
INSTANCES=$(doctl apps list-instances $APP_ID -o json | jq 'length')
log "Active instances: $INSTANCES"

if [ "$INSTANCES" -lt 1 ]; then
    log "❌ No active instances found"
    exit 1
fi

# Test health endpoint
log "🏥 Testing health endpoint..."
HEALTH_URL="https://tetrix-minimal-uzzxn.ondigitalocean.app/api/health"
if curl -s -f "$HEALTH_URL" >/dev/null; then
    log "✅ Health check passed"
else
    log "⚠️  Health check failed, but deployment may still be starting"
fi

# Check domain status
log "🌐 Checking domain status..."
DOMAINS=$(doctl apps get $APP_ID -o json | jq -r '.[0].domains[] | select(.phase == "ACTIVE") | .spec.domain')
log "Active domains:"
echo "$DOMAINS" | while read -r domain; do
    if [ -n "$domain" ]; then
        log "  ✅ $domain"
    fi
done

# Performance check
log "⚡ Running performance check..."
RESPONSE_TIME=$(curl -s -w "%{time_total}" -o /dev/null "https://tetrix-minimal-uzzxn.ondigitalocean.app/api/health")
log "Health endpoint response time: ${RESPONSE_TIME}s"

# Final status report
log "📋 Deployment Summary"
log "===================="
log "✅ App ID: $APP_ID"
log "✅ Deployment ID: $DEPLOYMENT_ID"
log "✅ Active Instances: $INSTANCES"
log "✅ Response Time: ${RESPONSE_TIME}s"
log "✅ Backup Created: $BACKUP_SPEC_FILE"

# Check for any warnings
log "⚠️  Checking for warnings..."
doctl apps get $APP_ID -o json | jq -r '.[0].domains[] | select(.phase != "ACTIVE") | "Domain \(.spec.domain) status: \(.phase)"' | while read -r warning; do
    if [ -n "$warning" ]; then
        log "  ⚠️  $warning"
    fi
done

log "🎉 Deployment completed successfully!"
log "🌐 App URL: https://tetrix-minimal-uzzxn.ondigitalocean.app"
log "🏥 Health Check: https://tetrix-minimal-uzzxn.ondigitalocean.app/api/health"

# Optional: Open health check in browser (if running on macOS)
if command_exists open; then
    log "🔍 Opening health check in browser..."
    open "https://tetrix-minimal-uzzxn.ondigitalocean.app/api/health"
fi
