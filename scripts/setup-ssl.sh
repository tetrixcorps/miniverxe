#!/bin/bash

# SSL Certificate Setup Script for TETRIX Domain
# This script will install and configure SSL certificates for tetrixcorp.com

set -e

echo "🔐 Setting up SSL certificates for tetrixcorp.com..."

# Update system packages
echo "📦 Updating system packages..."
apt update

# Install Certbot and Nginx plugin
echo "🔧 Installing Certbot and Nginx plugin..."
apt install -y certbot python3-certbot-nginx

# Check if Nginx is running
echo "🌐 Checking Nginx status..."
if ! systemctl is-active --quiet nginx; then
    echo "⚠️ Nginx is not running. Starting Nginx..."
    systemctl start nginx
    systemctl enable nginx
fi

# Backup current Nginx configuration
echo "💾 Backing up current Nginx configuration..."
cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup.$(date +%Y%m%d_%H%M%S)

# Create a basic Nginx configuration for SSL setup
echo "⚙️ Configuring Nginx for SSL..."
cat > /etc/nginx/sites-available/tetrixcorp.com << 'EOF'
server {
    listen 80;
    server_name tetrixcorp.com www.tetrixcorp.com;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/tetrixcorp.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
nginx -t

# Reload Nginx
echo "🔄 Reloading Nginx..."
systemctl reload nginx

# Obtain SSL certificate using Certbot
echo "🔐 Obtaining SSL certificate from Let's Encrypt..."
certbot --nginx -d tetrixcorp.com -d www.tetrixcorp.com --non-interactive --agree-tos --email admin@tetrixcorp.com

# Set up automatic renewal
echo "⏰ Setting up automatic certificate renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# Test SSL certificate
echo "🧪 Testing SSL certificate..."
if curl -s -o /dev/null -w "%{http_code}" https://tetrixcorp.com | grep -q "200"; then
    echo "✅ SSL certificate is working!"
else
    echo "⚠️ SSL certificate test failed. Checking configuration..."
fi

# Show certificate information
echo "📋 Certificate information:"
certbot certificates

echo "🎉 SSL setup complete!"
echo "🌐 Your site should now be accessible at:"
echo "   - https://tetrixcorp.com"
echo "   - https://www.tetrixcorp.com"
