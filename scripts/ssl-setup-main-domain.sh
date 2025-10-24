#!/bin/bash

# SSL Setup Script for Main Domain Only
# This script sets up SSL for tetrixcorp.com first, then we can add www later

set -e

DOMAIN="tetrixcorp.com"

echo "🔐 SSL Certificate Setup - Main Domain Only"
echo "==========================================="
echo "Domain: $DOMAIN"
echo "Timestamp: $(date)"
echo ""

echo "📋 Step 1: Updating system packages..."
apt-get update -y

echo "📋 Step 2: Installing Certbot and Nginx plugin..."
apt-get install -y certbot python3-certbot-nginx

echo "📋 Step 3: Checking current Nginx configuration..."
nginx -t

echo "📋 Step 4: Obtaining SSL certificate for main domain only..."
certbot --nginx \
    -d $DOMAIN \
    --non-interactive \
    --agree-tos \
    --email admin@$DOMAIN \
    --redirect

echo "📋 Step 5: Setting up automatic certificate renewal..."
(crontab -l 2>/dev/null; echo '0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx') | crontab -

echo "📋 Step 6: Testing SSL configuration..."
nginx -t && systemctl reload nginx

echo "📋 Step 7: Verifying SSL certificate..."
certbot certificates

echo ""
echo "🎉 SSL Certificate Setup Complete for Main Domain!"
echo "=================================================="
echo "✅ Domain: https://$DOMAIN"
echo "✅ Automatic renewal: Configured"
echo "✅ Certificate provider: Let's Encrypt (Free)"
echo ""
echo "Testing HTTPS access..."
if curl -s -I https://$DOMAIN | grep -q "200 OK"; then
    echo "✅ HTTPS access successful!"
    echo "🔒 SSL certificate is working properly"
else
    echo "⚠️  HTTPS test failed, but certificate may still be setting up"
    echo "Please wait a few minutes and test again"
fi

echo ""
echo "Next steps:"
echo "1. Test https://$DOMAIN in your browser"
echo "2. Once confirmed working, we can add www.tetrixcorp.com"
echo "3. Run: certbot --nginx -d www.$DOMAIN --expand"
