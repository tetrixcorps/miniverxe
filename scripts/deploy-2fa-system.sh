#!/bin/bash

# TETRIX 2FA System Deployment Script
# Handles build and runtime errors for DigitalOcean deployment

set -euo pipefail

# Configuration
APP_ID="${DO_APP_ID_PRODUCTION:-ca96485c-ee6b-401b-b1a2-8442c3bc7f04}"
APP_SPEC=".do/app-2fa-optimized.yaml"
BACKUP_DIR=".do/backups"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup-$TIMESTAMP.yaml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Error handling
handle_error() {
    local exit_code=$?
    local line_number=$1
    error "Script failed at line $line_number with exit code $exit_code"
    
    # Try to get deployment logs
    log "Attempting to get deployment logs..."
    if command -v doctl &> /dev/null; then
        doctl apps logs "$APP_ID" --type BUILD --tail 50 || true
        doctl apps logs "$APP_ID" --type RUN --tail 50 || true
    fi
    
    exit $exit_code
}

# Set up error handling
trap 'handle_error $LINENO' ERR

# Create backup directory
mkdir -p "$BACKUP_DIR"

log "🚀 Starting TETRIX 2FA System Deployment"
log "App ID: $APP_ID"
log "App Spec: $APP_SPEC"

# Step 1: Pre-deployment validation
log "🔍 Running pre-deployment validation..."

# Check if doctl is available
if ! command -v doctl &> /dev/null; then
    error "doctl is not installed or not in PATH"
    exit 1
fi

# Check if app spec exists
if [ ! -f "$APP_SPEC" ]; then
    error "App spec file not found: $APP_SPEC"
    exit 1
fi

# Validate app spec
if ! python3 -c "import yaml; yaml.safe_load(open('$APP_SPEC'))" 2>/dev/null; then
    error "Invalid YAML in app spec file"
    exit 1
fi

success "Pre-deployment validation passed"

# Step 2: Backup current deployment
log "💾 Creating backup of current deployment..."
if doctl apps get "$APP_ID" --output yaml > "$BACKUP_FILE" 2>/dev/null; then
    success "Backup created: $BACKUP_FILE"
else
    warning "Could not create backup (app might not exist yet)"
fi

# Step 3: Check current app status
log "📊 Checking current app status..."
CURRENT_STATUS=$(doctl apps get "$APP_ID" --output json 2>/dev/null | jq -r '.active_deployment.phase // "UNKNOWN"' || echo "UNKNOWN")
log "Current deployment status: $CURRENT_STATUS"

# Step 4: Update app with new spec
log "🔄 Updating app with new spec..."
if doctl apps update "$APP_ID" --spec "$APP_SPEC"; then
    success "App spec updated successfully"
else
    error "Failed to update app spec"
    exit 1
fi

# Step 5: Create new deployment
log "🚀 Creating new deployment..."
DEPLOYMENT_ID=$(doctl apps create-deployment "$APP_ID" --force-rebuild --output json | jq -r '.deployment.id // empty')

if [ -z "$DEPLOYMENT_ID" ]; then
    error "Failed to create deployment"
    exit 1
fi

log "Deployment ID: $DEPLOYMENT_ID"

# Step 6: Monitor deployment progress
log "⏳ Monitoring deployment progress..."
DEPLOYMENT_TIMEOUT=1800  # 30 minutes
CHECK_INTERVAL=30        # 30 seconds
ELAPSED_TIME=0

while [ $ELAPSED_TIME -lt $DEPLOYMENT_TIMEOUT ]; do
    DEPLOYMENT_PHASE=$(doctl apps get-deployment "$APP_ID" "$DEPLOYMENT_ID" --output json | jq -r '.phase // "UNKNOWN"')
    log "Deployment phase: $DEPLOYMENT_PHASE"
    
    case "$DEPLOYMENT_PHASE" in
        "ACTIVE")
            success "Deployment successful!"
            break
            ;;
        "FAILED"|"CANCELED")
            error "Deployment failed or was canceled"
            log "Getting deployment logs..."
            doctl apps logs "$APP_ID" --deployment "$DEPLOYMENT_ID" --type BUILD --tail 50
            doctl apps logs "$APP_ID" --deployment "$DEPLOYMENT_ID" --type RUN --tail 50
            exit 1
            ;;
        "PENDING"|"BUILDING"|"DEPLOYING")
            log "Still deploying... Waiting $CHECK_INTERVAL seconds"
            sleep $CHECK_INTERVAL
            ELAPSED_TIME=$((ELAPSED_TIME + CHECK_INTERVAL))
            ;;
        *)
            warning "Unknown deployment phase: $DEPLOYMENT_PHASE"
            sleep $CHECK_INTERVAL
            ELAPSED_TIME=$((ELAPSED_TIME + CHECK_INTERVAL))
            ;;
    esac
done

if [ $ELAPSED_TIME -ge $DEPLOYMENT_TIMEOUT ]; then
    error "Deployment timed out after $DEPLOYMENT_TIMEOUT seconds"
    exit 1
fi

# Step 7: Post-deployment health checks
log "🏥 Running post-deployment health checks..."

# Get app URL
APP_URL=$(doctl apps get "$APP_ID" --output json | jq -r '.active_deployment.urls[0] // empty')

if [ -z "$APP_URL" ]; then
    error "Could not get app URL"
    exit 1
fi

log "App URL: $APP_URL"

# Health check with retries
HEALTH_CHECK_RETRIES=5
HEALTH_CHECK_INTERVAL=30

for i in $(seq 1 $HEALTH_CHECK_RETRIES); do
    log "Health check attempt $i/$HEALTH_CHECK_RETRIES..."
    
    if curl -f -s "$APP_URL/api/health" > /dev/null; then
        success "Health check passed"
        break
    else
        if [ $i -eq $HEALTH_CHECK_RETRIES ]; then
            error "Health check failed after $HEALTH_CHECK_RETRIES attempts"
            log "App might still be starting up. Check logs:"
            doctl apps logs "$APP_ID" --type RUN --tail 50
            exit 1
        else
            warning "Health check failed, retrying in $HEALTH_CHECK_INTERVAL seconds..."
            sleep $HEALTH_CHECK_INTERVAL
        fi
    fi
done

# Step 8: Test 2FA endpoints
log "🧪 Testing 2FA endpoints..."

# Test 2FA initiate endpoint
if curl -f -s -X POST "$APP_URL/api/v2/2fa/initiate" \
    -H "Content-Type: application/json" \
    -d '{"phoneNumber":"+1234567890","method":"sms"}' > /dev/null; then
    success "2FA initiate endpoint working"
else
    warning "2FA initiate endpoint test failed"
fi

# Test homepage
if curl -f -s "$APP_URL/" > /dev/null; then
    success "Homepage accessible"
else
    warning "Homepage test failed"
fi

# Step 9: Deployment summary
log "📋 Deployment Summary"
log "===================="
log "App ID: $APP_ID"
log "Deployment ID: $DEPLOYMENT_ID"
log "App URL: $APP_URL"
log "Health Check: $APP_URL/api/health"
log "2FA Initiate: $APP_URL/api/v2/2fa/initiate"
log "Backup File: $BACKUP_FILE"

success "🎉 TETRIX 2FA System deployment completed successfully!"
success "🌐 Application is live at: $APP_URL"

# Step 10: Optional rollback function
rollback() {
    log "🔄 Rolling back to previous deployment..."
    if [ -f "$BACKUP_FILE" ]; then
        doctl apps update "$APP_ID" --spec "$BACKUP_FILE"
        doctl apps create-deployment "$APP_ID" --force-rebuild
        success "Rollback completed"
    else
        error "No backup file found for rollback"
    fi
}

# Export rollback function for manual use
export -f rollback

log "💡 To rollback if needed, run: rollback"
