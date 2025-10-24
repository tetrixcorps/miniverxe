#!/bin/bash

# Digital Ocean SSL Certificate Setup Script
# Based on: https://docs.digitalocean.com/support/how-do-i-install-an-ssl-certificate-on-a-droplet/
# This script sets up Let's Encrypt SSL certificates on your Digital Ocean droplet

set -e

DROPLET_IP="207.154.193.187"
DOMAIN="tetrixcorp.com"
WWW_DOMAIN="www.tetrixcorp.com"
SSH_KEY_PATH="$HOME/.ssh/tetrix_droplet_key"
APP_DIR="/opt/tetrix/miniverxe"

echo "🔐 Digital Ocean SSL Certificate Setup"
echo "======================================"
echo "Domain: $DOMAIN"
echo "Droplet IP: $DROPLET_IP"
echo "Timestamp: $(date)"
echo ""

# Check if SSH key exists
if [ ! -f "$SSH_KEY_PATH" ]; then
    echo "❌ SSH key not found at $SSH_KEY_PATH"
    echo "Please ensure your SSH key is available for droplet access"
    exit 1
fi

echo "📋 Step 1: Installing Certbot and Nginx plugin on droplet..."
ssh -i "$SSH_KEY_PATH" root@$DROPLET_IP "
    echo 'Updating system packages...'
    apt-get update -y
    
    echo 'Installing Certbot and Nginx plugin...'
    apt-get install -y certbot python3-certbot-nginx
    
    echo 'Checking Nginx status...'
    systemctl status nginx --no-pager || echo 'Nginx status check completed'
"

echo ""
echo "📋 Step 2: Configuring Nginx for SSL certificate generation..."
ssh -i "$SSH_KEY_PATH" root@$DROPLET_IP "
    echo 'Creating temporary Nginx configuration for SSL setup...'
    
    # Create a temporary Nginx configuration that allows both HTTP and HTTPS
    cat > /etc/nginx/sites-available/tetrix-ssl-temp << 'EOF'
server {
    listen 80;
    server_name $DOMAIN $WWW_DOMAIN;
    
    # Allow Let's Encrypt challenges
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        try_files \$uri =404;
    }
    
    # Proxy everything else to the app
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

    # Enable the temporary configuration
    ln -sf /etc/nginx/sites-available/tetrix-ssl-temp /etc/nginx/sites-enabled/
    
    # Remove default configuration if it exists
    rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    nginx -t
    
    # Reload Nginx
    systemctl reload nginx
    
    echo 'Nginx configured for SSL certificate generation'
"

echo ""
echo "📋 Step 3: Obtaining SSL certificate from Let's Encrypt..."
ssh -i "$SSH_KEY_PATH" root@$DROPLET_IP "
    echo 'Obtaining SSL certificate for $DOMAIN and $WWW_DOMAIN...'
    
    # Run Certbot to obtain the certificate
    certbot --nginx \
        -d $DOMAIN \
        -d $WWW_DOMAIN \
        --non-interactive \
        --agree-tos \
        --email admin@$DOMAIN \
        --redirect
    
    echo 'SSL certificate obtained successfully!'
"

echo ""
echo "📋 Step 4: Verifying SSL certificate installation..."
ssh -i "$SSH_KEY_PATH" root@$DROPLET_IP "
    echo 'Checking certificate status...'
    certbot certificates
    
    echo 'Testing SSL configuration...'
    nginx -t
    
    echo 'Restarting Nginx to ensure SSL is active...'
    systemctl restart nginx
    
    echo 'SSL certificate installation completed!'
"

echo ""
echo "📋 Step 5: Setting up automatic certificate renewal..."
ssh -i "$SSH_KEY_PATH" root@$DROPLET_IP "
    echo 'Setting up automatic certificate renewal...'
    
    # Add renewal cron job
    (crontab -l 2>/dev/null; echo '0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx') | crontab -
    
    echo 'Automatic renewal configured!'
"

echo ""
echo "📋 Step 6: Testing SSL certificate..."
echo "Testing HTTPS access to $DOMAIN..."

# Wait a moment for Nginx to restart
sleep 5

# Test HTTPS access
if curl -s -I https://$DOMAIN | grep -q "200 OK"; then
    echo "✅ HTTPS access successful!"
    echo "🔒 SSL certificate is working properly"
else
    echo "⚠️  HTTPS test failed, checking configuration..."
    ssh -i "$SSH_KEY_PATH" root@$DROPLET_IP "nginx -t && systemctl status nginx"
fi

echo ""
echo "🎉 SSL Certificate Setup Complete!"
echo "=================================="
echo "✅ Domain: https://$DOMAIN"
echo "✅ WWW: https://$WWW_DOMAIN"
echo "✅ Automatic renewal: Configured"
echo "✅ Certificate provider: Let's Encrypt (Free)"
echo ""
echo "Your TETRIX application is now secured with SSL!"
echo "Users can access your site at: https://$DOMAIN"
