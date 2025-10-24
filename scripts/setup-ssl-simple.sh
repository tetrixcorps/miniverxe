#!/bin/bash

# Simple SSL Setup Script for TETRIX
# This script sets up SSL using Let's Encrypt on the existing droplet setup

set -e

DROPLET_IP="207.154.193.187"
DOMAIN="tetrixcorp.com"
WWW_DOMAIN="www.tetrixcorp.com"

echo "🔐 Simple SSL Setup for TETRIX"
echo "==============================="
echo "Domain: $DOMAIN"
echo "Droplet IP: $DROPLET_IP"
echo "Timestamp: $(date)"
echo ""

echo "📋 Step 1: Testing current application access..."
if curl -s -I http://$DOMAIN | grep -q "200 OK"; then
    echo "✅ Application is accessible via HTTP"
else
    echo "❌ Application not accessible. Please check droplet status."
    exit 1
fi

echo ""
echo "📋 Step 2: Installing Certbot on droplet..."
echo "Please run the following commands on your droplet via Digital Ocean Console:"
echo ""
echo "1. Open Digital Ocean Console: https://cloud.digitalocean.com/droplets/525612689/console"
echo "2. Login to the droplet"
echo "3. Run these commands:"
echo ""
echo "   # Update system packages"
echo "   apt-get update -y"
echo ""
echo "   # Install Certbot and Nginx plugin"
echo "   apt-get install -y certbot python3-certbot-nginx"
echo ""
echo "   # Check current Nginx configuration"
echo "   nginx -t"
echo ""
echo "   # Obtain SSL certificate"
echo "   certbot --nginx -d $DOMAIN -d $WWW_DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN"
echo ""
echo "   # Set up automatic renewal"
echo "   (crontab -l 2>/dev/null; echo '0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx') | crontab -"
echo ""
echo "   # Test SSL configuration"
echo "   nginx -t && systemctl reload nginx"
echo ""

echo "📋 Step 3: After running the commands above, test HTTPS access..."
echo "Run this command to test:"
echo "   curl -I https://$DOMAIN"
echo ""

echo "🎯 Expected Results:"
echo "==================="
echo "✅ HTTPS access at https://$DOMAIN"
echo "✅ HTTP redirects to HTTPS"
echo "✅ Valid SSL certificate from Let's Encrypt"
echo "✅ Automatic certificate renewal configured"
echo ""

echo "📞 Alternative: If you prefer, I can create a script that you can upload to the droplet"
echo "and run directly. Would you like me to create that script?"