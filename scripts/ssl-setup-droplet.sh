#!/bin/bash

# SSL Setup Script for Droplet
# Run this script directly on the droplet

set -e

DOMAIN="tetrixcorp.com"
WWW_DOMAIN="www.tetrixcorp.com"

echo "🔐 SSL Certificate Setup on Droplet"
echo "===================================="
echo "Domain: $DOMAIN"
echo "Timestamp: $(date)"
echo ""

echo "📋 Step 1: Updating system packages..."
apt-get update -y

echo "📋 Step 2: Installing Certbot and Nginx plugin..."
apt-get install -y certbot python3-certbot-nginx

echo "📋 Step 3: Checking current Nginx configuration..."
nginx -t

echo "📋 Step 4: Obtaining SSL certificate from Let's Encrypt..."
certbot --nginx \
    -d $DOMAIN \
    -d $WWW_DOMAIN \
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
echo "🎉 SSL Certificate Setup Complete!"
echo "=================================="
echo "✅ Domain: https://$DOMAIN"
echo "✅ WWW: https://$WWW_DOMAIN"
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
echo "Your TETRIX application is now secured with SSL!"
echo "Users can access your site at: https://$DOMAIN"
