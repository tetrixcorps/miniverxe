#!/bin/bash

# Optimized SSL Certificate Setup for TETRIX
# This script works with the existing Docker Compose setup

set -e

echo "🔐 Setting up SSL certificates for TETRIX (Optimized approach)..."

# Install Certbot if not already installed
echo "📦 Installing Certbot..."
apt update
apt install -y certbot

# Create webroot directory
echo "📁 Creating webroot directory..."
mkdir -p /var/www/certbot

# Check if domain is resolving
echo "🧪 Testing domain resolution..."
if curl -s -o /dev/null -w "%{http_code}" http://tetrixcorp.com | grep -q "200"; then
    echo "✅ Domain is resolving correctly"
else
    echo "❌ Domain is not resolving. Please check DNS configuration first."
    echo "Current DNS status:"
    curl -I http://tetrixcorp.com || echo "Domain not accessible"
    exit 1
fi

# Create a temporary Nginx configuration that serves both the app and challenge files
echo "⚙️ Creating temporary Nginx configuration for SSL challenge..."
cat > /tmp/nginx-ssl-challenge.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name tetrixcorp.com www.tetrixcorp.com;
        
        # Serve ACME challenge files
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
            try_files $uri =404;
        }
        
        # Proxy everything else to the app
        location / {
            proxy_pass http://host.docker.internal:8080;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF

# Stop the current Nginx container
echo "⏸️ Stopping current Nginx container..."
docker stop miniverxe-nginx-1

# Start a new Nginx container with the challenge configuration
echo "🚀 Starting Nginx container for SSL challenge..."
docker run -d --name nginx-ssl-challenge \
    -p 80:80 \
    -v /tmp/nginx-ssl-challenge.conf:/etc/nginx/nginx.conf \
    -v /var/www/certbot:/var/www/certbot \
    nginx:alpine

# Wait for Nginx to start
echo "⏳ Waiting for Nginx to start..."
sleep 10

# Test that the webroot is accessible
echo "🧪 Testing webroot accessibility..."
curl -s http://tetrixcorp.com/.well-known/acme-challenge/ || echo "Webroot not accessible yet"

# Create a test file to verify webroot is working
echo "test" > /var/www/certbot/test.txt
if curl -s http://tetrixcorp.com/.well-known/acme-challenge/test.txt | grep -q "test"; then
    echo "✅ Webroot is accessible"
else
    echo "❌ Webroot is not accessible. Checking configuration..."
    docker logs nginx-ssl-challenge
    exit 1
fi

# Obtain SSL certificate using Certbot
echo "🔐 Obtaining SSL certificate from Let's Encrypt..."
certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email admin@tetrixcorp.com \
    --agree-tos \
    --no-eff-email \
    --non-interactive \
    -d tetrixcorp.com

# Stop the challenge Nginx container
echo "🛑 Stopping challenge Nginx container..."
docker stop nginx-ssl-challenge
docker rm nginx-ssl-challenge

# Create SSL directory in the main Nginx container
echo "📁 Creating SSL directory in Nginx container..."
docker exec miniverxe-nginx-1 mkdir -p /etc/nginx/ssl

# Copy SSL certificates to the Nginx container
echo "📋 Copying SSL certificates to Nginx container..."
docker cp /etc/letsencrypt/live/tetrixcorp.com/fullchain.pem miniverxe-nginx-1:/etc/nginx/ssl/cert.pem
docker cp /etc/letsencrypt/live/tetrixcorp.com/privkey.pem miniverxe-nginx-1:/etc/nginx/ssl/key.pem

# Start the main Nginx container
echo "🔄 Starting main Nginx container with SSL certificates..."
docker start miniverxe-nginx-1

# Wait for Nginx to start
echo "⏳ Waiting for Nginx to start..."
sleep 15

# Set up automatic certificate renewal
echo "⏰ Setting up automatic certificate renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && docker restart miniverxe-nginx-1") | crontab -

# Test SSL certificate
echo "🧪 Testing SSL certificate..."
sleep 5
if curl -s -o /dev/null -w "%{http_code}" https://tetrixcorp.com | grep -q "200"; then
    echo "✅ SSL certificate is working!"
    echo "🌐 Your site is now accessible at:"
    echo "   - https://tetrixcorp.com"
    echo "   - HTTP requests will be redirected to HTTPS"
else
    echo "⚠️ SSL certificate test failed. Checking configuration..."
    docker logs miniverxe-nginx-1
    echo "Trying HTTP redirect test..."
    curl -I http://tetrixcorp.com
fi

# Show certificate information
echo "📋 Certificate information:"
certbot certificates

echo "🎉 SSL setup complete!"
