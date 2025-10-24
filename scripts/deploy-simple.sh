#!/bin/bash

# Simple TETRIX Deployment Script for DigitalOcean Droplet
# This script deploys the main TETRIX application with all recent changes

set -e  # Exit on any error

echo "🚀 Starting Simple TETRIX Deployment to DigitalOcean Droplet"
echo "============================================================"

# Configuration
DROPLET_IP="${DROPLET_IP:-your-droplet-ip}"
DROPLET_USER="${DROPLET_USER:-root}"
APP_DIR="/opt/tetrix"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if DROPLET_IP is set
if [ -z "$DROPLET_IP" ] || [ "$DROPLET_IP" = "your-droplet-ip" ]; then
    print_error "DROPLET_IP environment variable not set!"
    echo "Please set it with: export DROPLET_IP=your-actual-droplet-ip"
    exit 1
fi

# Create production environment file
print_status "Creating production environment file..."
cat > .env.production << EOF
# TETRIX Production Environment Variables
NODE_ENV=production
PORT=8080
HOST=0.0.0.0

# Database Configuration (using SQLite for simplicity)
DATABASE_URL=file:./data/tetrix.db

# JWT Configuration
JWT_SECRET=tetrix_jwt_$(openssl rand -hex 32)

# TETRIX Domain Configuration
TETRIX_DOMAIN=https://tetrixcorp.com
CORS_ORIGINS=https://tetrixcorp.com,https://joromi.ai,https://iot.tetrixcorp.com,https://api.tetrixcorp.com

# 2FA Configuration (Telnyx)
TELNYX_API_KEY=${TELNYX_API_KEY:-}
TELNYX_VERIFY_API_URL=${TELNYX_VERIFY_API_URL:-https://api.telnyx.com/v2/verify}

# Sinch Configuration
SINCH_API_KEY=${SINCH_API_KEY:-}
SINCH_API_SECRET=${SINCH_API_SECRET:-}

# Mailgun Configuration
MAILGUN_API_KEY=${MAILGUN_API_KEY:-}
MAILGUN_DOMAIN=${MAILGUN_DOMAIN:-}

# Stripe Configuration
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY:-}
STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY:-}

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=json
EOF

# Create simple Docker Compose file
print_status "Creating simple Docker Compose configuration..."
cat > docker-compose.simple.yml << 'EOF'
version: '3.8'

services:
  # Main TETRIX Application
  tetrix-app:
    build:
      context: .
      dockerfile: Dockerfile.tetrix
    container_name: tetrix-app
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=8080
      - HOST=0.0.0.0
    ports:
      - "8080:8080"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    env_file:
      - .env.production
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: tetrix-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - tetrix-app
EOF

# Create Nginx configuration
print_status "Creating Nginx configuration..."
mkdir -p nginx/ssl

cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream tetrix_app {
        server tetrix-app:8080;
    }
    
    server {
        listen 80;
        server_name _;
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        
        # Gzip compression
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
        
        # Main application proxy
        location / {
            proxy_pass http://tetrix_app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
        
        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF

# Transfer files to droplet
print_status "Transferring files to droplet..."
ssh ${DROPLET_USER}@${DROPLET_IP} "mkdir -p ${APP_DIR}"

# Transfer application files
print_status "Transferring application source code..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' --exclude '.astro' --exclude 'test-results' --exclude 'coverage' \
    ./ ${DROPLET_USER}@${DROPLET_IP}:${APP_DIR}/

# Setup Docker on droplet
print_status "Setting up Docker on droplet..."
ssh ${DROPLET_USER}@${DROPLET_IP} << 'EOF'
    # Update system
    apt-get update -y
    
    # Install Docker if not present
    if ! command -v docker &> /dev/null; then
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        systemctl enable docker
        systemctl start docker
    fi
    
    # Install Docker Compose if not present
    if ! command -v docker-compose &> /dev/null; then
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    fi
EOF

# Deploy application on droplet
print_status "Deploying application on droplet..."
ssh ${DROPLET_USER}@${DROPLET_IP} << EOF
    cd ${APP_DIR}
    
    # Stop existing containers
    docker-compose -f docker-compose.simple.yml down 2>/dev/null || true
    
    # Build and start new containers
    docker-compose -f docker-compose.simple.yml up -d --build
    
    # Wait for services to be ready
    echo "Waiting for services to start..."
    sleep 30
    
    # Check container status
    docker-compose -f docker-compose.simple.yml ps
EOF

# Verify deployment
print_status "Verifying deployment..."

# Check if application is responding
if curl -f http://${DROPLET_IP}:8080/ > /dev/null 2>&1; then
    print_success "Application is responding on port 8080"
else
    print_warning "Application may not be fully ready yet"
fi

# Check container status
ssh ${DROPLET_USER}@${DROPLET_IP} << 'EOF'
    cd /opt/tetrix
    echo "=== Container Status ==="
    docker-compose -f docker-compose.simple.yml ps
    
    echo "=== Container Logs (last 20 lines) ==="
    docker-compose -f docker-compose.simple.yml logs --tail=20
EOF

print_success "Deployment completed successfully!"

echo ""
echo "🎉 TETRIX Simple Deployment Completed!"
echo "======================================"
echo "Application URL: http://${DROPLET_IP}:8080"
echo "Health Check: http://${DROPLET_IP}:8080/health"
echo ""
echo "To check logs: ssh ${DROPLET_USER}@${DROPLET_IP} 'cd ${APP_DIR} && docker-compose -f docker-compose.simple.yml logs'"
echo "To restart: ssh ${DROPLET_USER}@${DROPLET_IP} 'cd ${APP_DIR} && docker-compose -f docker-compose.simple.yml restart'"
echo "To stop: ssh ${DROPLET_USER}@${DROPLET_IP} 'cd ${APP_DIR} && docker-compose -f docker-compose.simple.yml down'"
