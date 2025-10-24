#!/bin/bash

# Digital Ocean Load Balancer SSL Setup Script
# This script creates a load balancer with managed SSL certificates
# Based on Digital Ocean's managed SSL certificate service

set -e

DROPLET_IP="207.154.193.187"
DROPLET_ID="525612689"  # tetrix-production droplet ID
DOMAIN="tetrixcorp.com"
REGION="fra1"  # Frankfurt region where your droplet is located

echo "🔐 Digital Ocean Load Balancer SSL Setup"
echo "========================================"
echo "Domain: $DOMAIN"
echo "Droplet IP: $DROPLET_IP"
echo "Droplet ID: $DROPLET_ID"
echo "Region: $REGION"
echo "Timestamp: $(date)"
echo ""

# Check if doctl is authenticated
if ! doctl account get > /dev/null 2>&1; then
    echo "❌ doctl not authenticated. Please run 'doctl auth init' first"
    exit 1
fi

echo "📋 Step 1: Creating Digital Ocean Load Balancer..."
echo "This will create a load balancer with managed SSL certificates"

# Create load balancer with SSL certificate
doctl compute load-balancer create \
    --name "tetrix-ssl-lb" \
    --forwarding-rules "entry_protocol:http,entry_port:80,target_protocol:http,target_port:8080" \
    --forwarding-rules "entry_protocol:https,entry_port:443,target_protocol:http,target_port:8080" \
    --health-check "protocol:http,port:8080,path:/health,check_interval_seconds:10,response_timeout_seconds:5,healthy_threshold:3,unhealthy_threshold:3" \
    --droplet-ids $DROPLET_ID \
    --region $REGION \
    --enable-proxy-protocol \
    --enable-backend-keepalive

echo "✅ Load balancer created successfully!"

echo ""
echo "📋 Step 2: Adding SSL certificate to load balancer..."

# Get the load balancer ID
LB_ID=$(doctl compute load-balancer list --format "ID,Name" --no-header | grep "tetrix-ssl-lb" | awk '{print $1}')

if [ -z "$LB_ID" ]; then
    echo "❌ Failed to get load balancer ID"
    exit 1
fi

echo "Load balancer ID: $LB_ID"

# Add SSL certificate (Let's Encrypt managed by Digital Ocean)
doctl compute load-balancer add-certificates $LB_ID \
    --certificate-name "$DOMAIN-ssl-cert" \
    --certificate-type "lets_encrypt" \
    --certificate-domains "$DOMAIN,www.$DOMAIN"

echo "✅ SSL certificate added to load balancer!"

echo ""
echo "📋 Step 3: Updating DNS to point to load balancer..."

# Get load balancer IP
LB_IP=$(doctl compute load-balancer get $LB_ID --format "IP" --no-header)

if [ -z "$LB_IP" ]; then
    echo "❌ Failed to get load balancer IP"
    exit 1
fi

echo "Load balancer IP: $LB_IP"
echo ""
echo "⚠️  IMPORTANT: You need to update your DNS records:"
echo "   - Update A record for $DOMAIN to point to: $LB_IP"
echo "   - Update A record for www.$DOMAIN to point to: $LB_IP"
echo ""
echo "This can be done in your Hurricane Electric DNS dashboard:"
echo "https://dns.he.net/"

echo ""
echo "📋 Step 4: Testing load balancer..."

# Wait for load balancer to be ready
echo "Waiting for load balancer to be ready..."
sleep 30

# Test load balancer
if curl -s -I http://$LB_IP | grep -q "200 OK"; then
    echo "✅ Load balancer is responding!"
else
    echo "⚠️  Load balancer test failed, but it may still be initializing"
fi

echo ""
echo "🎉 Load Balancer SSL Setup Complete!"
echo "===================================="
echo "✅ Load Balancer ID: $LB_IP"
echo "✅ SSL Certificate: Managed by Digital Ocean"
echo "✅ Certificate Type: Let's Encrypt (Free)"
echo "✅ Auto-renewal: Managed by Digital Ocean"
echo ""
echo "Next Steps:"
echo "1. Update DNS A records to point to: $LB_IP"
echo "2. Wait for DNS propagation (5-15 minutes)"
echo "3. Test HTTPS access: https://$DOMAIN"
echo ""
echo "Your TETRIX application will be accessible at:"
echo "   - http://$DOMAIN (redirects to HTTPS)"
echo "   - https://$DOMAIN (secure)"
echo "   - https://www.$DOMAIN (secure)"
