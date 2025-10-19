#!/bin/bash

# TETRIX 2FA Authentication System - Deployment Monitor
# Monitors the DigitalOcean deployment progress

APP_ID="e137beef-7570-433b-a043-36fcd7360854"
DEPLOYMENT_ID="5032f2dc-d440-4d4c-9600-db04c609a9fc"

echo "🔍 Monitoring TETRIX 2FA Authentication System Deployment"
echo "========================================================"
echo "App ID: $APP_ID"
echo "Deployment ID: $DEPLOYMENT_ID"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

while true; do
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} Checking deployment status..."
    
    # Get deployment status
    DEPLOYMENT_STATUS=$(doctl apps get-deployment $APP_ID $DEPLOYMENT_ID 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        PHASE=$(echo "$DEPLOYMENT_STATUS" | awk 'NR>1 {print $4}')
        PROGRESS=$(echo "$DEPLOYMENT_STATUS" | awk 'NR>1 {print $3}')
        
        echo -e "  Phase: ${YELLOW}$PHASE${NC}"
        echo -e "  Progress: ${YELLOW}$PROGRESS${NC}"
        
        if [ "$PHASE" = "ACTIVE" ]; then
            echo -e "\n${GREEN}🎉 Deployment completed successfully!${NC}"
            
            # Get app URL
            APP_URL=$(doctl apps get $APP_ID --format "DefaultIngress" --no-header 2>/dev/null)
            if [ -n "$APP_URL" ]; then
                echo -e "\n${GREEN}🔗 Your 2FA API is now available at:${NC}"
                echo -e "  ${BLUE}https://$APP_URL${NC}"
                echo ""
                echo "📡 API Endpoints:"
                echo "  • POST https://$APP_URL/api/v2/2fa/initiate"
                echo "  • POST https://$APP_URL/api/v2/2fa/verify"
                echo "  • GET  https://$APP_URL/api/v2/2fa/status"
                echo ""
                echo "🧪 Test your deployment:"
                echo "  TEST_BASE_URL=https://$APP_URL node scripts/test-2fa-endpoints.js"
            fi
            break
        elif [ "$PHASE" = "FAILED" ]; then
            echo -e "\n${RED}❌ Deployment failed!${NC}"
            echo "Check the DigitalOcean dashboard for more details."
            break
        else
            echo -e "  ${YELLOW}Still building... waiting 30 seconds${NC}"
            sleep 30
        fi
    else
        echo -e "  ${RED}Error getting deployment status${NC}"
        sleep 30
    fi
    
    echo ""
done
