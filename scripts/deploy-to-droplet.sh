#!/bin/bash

# TETRIX Production Deployment Script for DigitalOcean Droplet
# This script deploys the complete TETRIX application with all recent changes

set -e  # Exit on any error

echo "🚀 Starting TETRIX Production Deployment to DigitalOcean Droplet"
echo "================================================================"

# Configuration
DROPLET_IP="${DROPLET_IP:-your-droplet-ip}"
DROPLET_USER="${DROPLET_USER:-root}"
APP_DIR="/opt/tetrix"
BACKUP_DIR="/opt/tetrix-backup-$(date +%Y%m%d-%H%M%S)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if required environment variables are set
check_environment() {
    print_status "Checking environment variables..."
    
    if [ -z "$DROPLET_IP" ] || [ "$DROPLET_IP" = "your-droplet-ip" ]; then
        print_error "DROPLET_IP environment variable not set!"
        echo "Please set it with: export DROPLET_IP=your-actual-droplet-ip"
        exit 1
    fi
    
    if [ -z "$POSTGRES_PASSWORD" ]; then
        print_warning "POSTGRES_PASSWORD not set, will use default"
        export POSTGRES_PASSWORD="tetrix_secure_password_$(date +%s)"
    fi
    
    if [ -z "$REDIS_PASSWORD" ]; then
        print_warning "REDIS_PASSWORD not set, will use default"
        export REDIS_PASSWORD="tetrix_redis_secure_$(date +%s)"
    fi
    
    if [ -z "$JWT_SECRET" ]; then
        print_warning "JWT_SECRET not set, will generate one"
        export JWT_SECRET="tetrix_jwt_$(openssl rand -hex 32)"
    fi
    
    print_success "Environment variables checked"
}

# Create environment file for production
create_env_file() {
    print_status "Creating production environment file..."
    
    cat > .env.production << EOF
# TETRIX Production Environment Variables
NODE_ENV=production
PORT=8080
HOST=0.0.0.0

# Database Configuration
POSTGRES_DB=tetrix
POSTGRES_USER=tetrix
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
DATABASE_URL=postgresql://tetrix:${POSTGRES_PASSWORD}@postgres:5432/tetrix

# Redis Configuration
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_URL=redis://redis:6379

# JWT Configuration
JWT_SECRET=${JWT_SECRET}

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
CORS_ORIGINS=https://tetrixcorp.com,https://joromi.ai,https://iot.tetrixcorp.com,https://api.tetrixcorp.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=json
EOF

    print_success "Production environment file created"
}

# Build Docker images locally
build_images() {
    print_status "Building Docker images locally..."
    
    # Build main TETRIX application
    print_status "Building TETRIX application image..."
    docker build -f Dockerfile.tetrix -t tetrix-app:latest .
    
    # Build API service if it exists
    if [ -d "./services/api" ]; then
        print_status "Building API service image..."
        docker build -f ./services/api/Dockerfile -t tetrix-api:latest ./services/api
    fi
    
    # Build eSIM ordering service if it exists
    if [ -d "./services/esim-ordering" ]; then
        print_status "Building eSIM ordering service image..."
        docker build -f ./services/esim-ordering/Dockerfile -t tetrix-esim:latest ./services/esim-ordering
    fi
    
    print_success "Docker images built successfully"
}

# Save Docker images to tar files
save_images() {
    print_status "Saving Docker images to tar files..."
    
    docker save tetrix-app:latest > tetrix-app.tar
    docker save postgres:15-alpine > postgres.tar
    docker save redis:7-alpine > redis.tar
    docker save nginx:alpine > nginx.tar
    
    if [ -f "tetrix-api:latest" ]; then
        docker save tetrix-api:latest > tetrix-api.tar
    fi
    
    if [ -f "tetrix-esim:latest" ]; then
        docker save tetrix-esim:latest > tetrix-esim.tar
    fi
    
    print_success "Docker images saved to tar files"
}

# Transfer files to droplet
transfer_files() {
    print_status "Transferring files to droplet..."
    
    # Create application directory on droplet
    ssh ${DROPLET_USER}@${DROPLET_IP} "mkdir -p ${APP_DIR}"
    
    # Transfer application files
    print_status "Transferring application source code..."
    rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' --exclude '.astro' \
        ./ ${DROPLET_USER}@${DROPLET_IP}:${APP_DIR}/
    
    # Transfer Docker images
    print_status "Transferring Docker images..."
    scp *.tar ${DROPLET_USER}@${DROPLET_IP}:${APP_DIR}/
    
    # Transfer environment file
    scp .env.production ${DROPLET_USER}@${DROPLET_IP}:${APP_DIR}/.env
    
    print_success "Files transferred successfully"
}

# Setup Docker on droplet
setup_docker() {
    print_status "Setting up Docker on droplet..."
    
    ssh ${DROPLET_USER}@${DROPLET_IP} << 'EOF'
        # Update system
        apt-get update
        
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
        
        # Create docker network
        docker network create tetrix-network 2>/dev/null || true
EOF
    
    print_success "Docker setup completed"
}

# Load Docker images on droplet
load_images() {
    print_status "Loading Docker images on droplet..."
    
    ssh ${DROPLET_USER}@${DROPLET_IP} << EOF
        cd ${APP_DIR}
        
        # Load Docker images
        docker load < tetrix-app.tar
        docker load < postgres.tar
        docker load < redis.tar
        docker load < nginx.tar
        
        if [ -f "tetrix-api.tar" ]; then
            docker load < tetrix-api.tar
        fi
        
        if [ -f "tetrix-esim.tar" ]; then
            docker load < tetrix-esim.tar
        fi
        
        # Clean up tar files
        rm -f *.tar
EOF
    
    print_success "Docker images loaded on droplet"
}

# Create production Docker Compose file
create_production_compose() {
    print_status "Creating production Docker Compose configuration..."
    
    cat > docker-compose.production.yml << 'EOF'
version: '3.8'

services:
  # Main TETRIX Application
  tetrix-app:
    image: tetrix-app:latest
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
    networks:
      - tetrix-network
    depends_on:
      - postgres
      - redis
    env_file:
      - .env

  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: tetrix-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_DB=tetrix
      - POSTGRES_USER=tetrix
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U tetrix -d tetrix"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - tetrix-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: tetrix-redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - tetrix-network

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
    networks:
      - tetrix-network

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local

networks:
  tetrix-network:
    driver: bridge
EOF
    
    print_success "Production Docker Compose file created"
}

# Create Nginx configuration
create_nginx_config() {
    print_status "Creating Nginx configuration..."
    
    mkdir -p nginx
    
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
        server_name tetrixcorp.com www.tetrixcorp.com;
        
        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }
    
    server {
        listen 443 ssl http2;
        server_name tetrixcorp.com www.tetrixcorp.com;
        
        # SSL Configuration (you'll need to add your SSL certificates)
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        
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
    
    print_success "Nginx configuration created"
}

# Deploy application on droplet
deploy_application() {
    print_status "Deploying application on droplet..."
    
    ssh ${DROPLET_USER}@${DROPLET_IP} << EOF
        cd ${APP_DIR}
        
        # Stop existing containers
        docker-compose -f docker-compose.production.yml down 2>/dev/null || true
        
        # Start new containers
        docker-compose -f docker-compose.production.yml up -d
        
        # Wait for services to be ready
        echo "Waiting for services to start..."
        sleep 30
        
        # Check container status
        docker-compose -f docker-compose.production.yml ps
EOF
    
    print_success "Application deployed successfully"
}

# Verify deployment
verify_deployment() {
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
        docker-compose -f docker-compose.production.yml ps
        
        echo "=== Container Logs (last 20 lines) ==="
        docker-compose -f docker-compose.production.yml logs --tail=20
EOF
    
    print_success "Deployment verification completed"
}

# Main deployment function
main() {
    echo "🚀 TETRIX Production Deployment Started"
    echo "========================================"
    echo "Droplet IP: ${DROPLET_IP}"
    echo "App Directory: ${APP_DIR}"
    echo "========================================"
    
    check_environment
    create_env_file
    build_images
    save_images
    create_production_compose
    create_nginx_config
    transfer_files
    setup_docker
    load_images
    deploy_application
    verify_deployment
    
    echo ""
    echo "🎉 TETRIX Production Deployment Completed!"
    echo "=========================================="
    echo "Application URL: http://${DROPLET_IP}:8080"
    echo "Health Check: http://${DROPLET_IP}:8080/health"
    echo ""
    echo "To check logs: ssh ${DROPLET_USER}@${DROPLET_IP} 'cd ${APP_DIR} && docker-compose -f docker-compose.production.yml logs'"
    echo "To restart: ssh ${DROPLET_USER}@${DROPLET_IP} 'cd ${APP_DIR} && docker-compose -f docker-compose.production.yml restart'"
    echo "To stop: ssh ${DROPLET_USER}@${DROPLET_IP} 'cd ${APP_DIR} && docker-compose -f docker-compose.production.yml down'"
}

# Run main function
main "$@"
