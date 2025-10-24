#!/bin/bash

# SSL Certificate Setup using existing Nginx container
# This script modifies the existing Nginx container to support SSL challenges

set -e

echo "🔐 Setting up SSL certificates using existing Nginx container..."

# Install Certbot if not already installed
echo "📦 Installing Certbot..."
apt update
apt install -y certbot

# Create webroot directory
echo "📁 Creating webroot directory..."
mkdir -p /var/www/certbot

# Create a simple Nginx configuration that serves both the app and challenge files
echo "⚙️ Creating Nginx configuration for SSL challenge..."
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
curl -s http://tetrixcorp.com/.well-known/acme-challenge/test.txt || echo "Test file not accessible"

# Obtain SSL certificate using Certbot
echo "🔐 Obtaining SSL certificate from Let's Encrypt..."
certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email admin@tetrixcorp.com \
    --agree-tos \
    --no-eff-email \
    --non-interactive \
    -d tetrixcorp.com \
    -d www.tetrixcorp.com

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

# Create updated Nginx configuration with SSL
echo "⚙️ Creating updated Nginx configuration with SSL..."
cat > /tmp/nginx-ssl-final.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name tetrixcorp.com www.tetrixcorp.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name tetrixcorp.com www.tetrixcorp.com;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Security Headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        location / {
            proxy_pass http://host.docker.internal:8080;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        # Health Check
        location /health {
            access_log off;
            proxy_pass http://host.docker.internal:8080/health;
            proxy_set_header Host $host;
        }
    }
}
EOF

# Copy the new configuration to the Nginx container
echo "📋 Updating Nginx configuration with SSL..."
docker cp /tmp/nginx-ssl-final.conf miniverxe-nginx-1:/etc/nginx/nginx.conf

# Start the Nginx container
echo "🔄 Starting Nginx container with SSL configuration..."
docker start miniverxe-nginx-1

# Wait for Nginx to start
echo "⏳ Waiting for Nginx to start..."
sleep 10

# Set up automatic certificate renewal
echo "⏰ Setting up automatic certificate renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && docker restart miniverxe-nginx-1") | crontab -

# Test SSL certificate
echo "🧪 Testing SSL certificate..."
sleep 5
if curl -s -o /dev/null -w "%{http_code}" https://tetrixcorp.com | grep -q "200"; then
    echo "✅ SSL certificate is working!"
else
    echo "⚠️ SSL certificate test failed. Checking configuration..."
    docker logs miniverxe-nginx-1
fi

# Show certificate information
echo "📋 Certificate information:"
certbot certificates

echo "🎉 SSL setup complete!"
echo "🌐 Your site should now be accessible at:"
echo "   - https://tetrixcorp.com"
echo "   - https://www.tetrixcorp.com"
echo "   - HTTP requests will be redirected to HTTPS"
