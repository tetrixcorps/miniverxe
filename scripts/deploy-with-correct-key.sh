#!/bin/bash

# TETRIX Deployment Script using doctl with correct SSH key
# This script uses doctl to access the droplet with the correct SSH key

set -e  # Exit on any error

echo "🚀 Starting TETRIX Deployment using doctl with correct SSH key"
echo "=============================================================="

# Configuration
DROPLET_NAME="tetrix-production"
DROPLET_IP="207.154.193.187"
APP_DIR="/opt/tetrix"
SSH_KEY_PATH="~/.ssh/tetrix_droplet_key"

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

# Check if doctl is available
check_doctl() {
    print_status "Checking doctl configuration..."
    
    if ! command -v doctl &> /dev/null; then
        print_error "doctl is not installed or not in PATH"
        exit 1
    fi
    
    # Check if authenticated
    if ! doctl auth list &> /dev/null; then
        print_error "doctl is not authenticated. Please run 'doctl auth init'"
        exit 1
    fi
    
    print_success "doctl is configured and authenticated"
}

# Get droplet information
get_droplet_info() {
    print_status "Getting droplet information..."
    
    # Get droplet details
    DROPLET_INFO=$(doctl compute droplet list --format "Name,PublicIPv4" --no-header | grep "$DROPLET_NAME")
    
    if [ -z "$DROPLET_INFO" ]; then
        print_error "Droplet '$DROPLET_NAME' not found"
        print_status "Available droplets:"
        doctl compute droplet list --format "Name,PublicIPv4,Status"
        exit 1
    fi
    
    DROPLET_IP=$(echo "$DROPLET_INFO" | awk '{print $2}')
    print_success "Found droplet: $DROPLET_NAME at $DROPLET_IP"
}

# Check droplet status
check_droplet_status() {
    print_status "Checking droplet status..."
    
    STATUS=$(doctl compute droplet list --format "Name,Status" --no-header | grep "$DROPLET_NAME" | awk '{print $2}')
    
    if [ "$STATUS" != "active" ]; then
        print_error "Droplet is not active. Status: $STATUS"
        exit 1
    fi
    
    print_success "Droplet is active and ready"
}

# Test SSH connection
test_ssh_connection() {
    print_status "Testing SSH connection..."
    
    if doctl compute ssh "$DROPLET_NAME" --ssh-key-path "$SSH_KEY_PATH" --ssh-command "whoami" &> /dev/null; then
        print_success "SSH connection successful"
    else
        print_error "SSH connection failed"
        exit 1
    fi
}

# Create deployment package
create_deployment_package() {
    print_status "Creating deployment package..."
    
    # Create a temporary directory for files
    TEMP_DIR="/tmp/tetrix-deployment-$(date +%s)"
    mkdir -p "$TEMP_DIR"
    
    # Copy application files to temp directory
    print_status "Preparing application files..."
    rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' --exclude '.astro' --exclude 'test-results' --exclude 'coverage' --exclude 'venv' \
        ./ "$TEMP_DIR/"
    
    # Create a deployment package
    print_status "Creating deployment package..."
    cd "$TEMP_DIR"
    tar -czf ../tetrix-deployment.tar.gz .
    cd - > /dev/null
    
    print_success "Deployment package created: /tmp/tetrix-deployment.tar.gz"
}

# Upload package to droplet
upload_package() {
    print_status "Uploading package to droplet..."
    
    # Use scp to upload the package
    scp -i "$SSH_KEY_PATH" /tmp/tetrix-deployment.tar.gz root@$DROPLET_IP:/tmp/ || {
        print_error "Failed to upload package. Please check SSH key configuration."
        exit 1
    }
    
    print_success "Package uploaded successfully"
}

# Setup application on droplet
setup_application() {
    print_status "Setting up application on droplet..."
    
    doctl compute ssh "$DROPLET_NAME" --ssh-key-path "$SSH_KEY_PATH" --ssh-command "
        cd $APP_DIR
        tar -xzf /tmp/tetrix-deployment.tar.gz
        rm -f /tmp/tetrix-deployment.tar.gz
        chmod +x *.sh
        
        # Create production environment file
        cat > .env.production << 'EOF'
# TETRIX Production Environment Variables
NODE_ENV=production
PORT=8080
HOST=0.0.0.0

# Database Configuration (using SQLite for simplicity)
DATABASE_URL=file:./data/tetrix.db

# JWT Configuration
JWT_SECRET=tetrix_jwt_\$(openssl rand -hex 32)

# TETRIX Domain Configuration
TETRIX_DOMAIN=https://tetrixcorp.com
CORS_ORIGINS=https://tetrixcorp.com,https://joromi.ai,https://iot.tetrixcorp.com,https://api.tetrixcorp.com

# 2FA Configuration (Telnyx)
TELNYX_API_KEY=\${TELNYX_API_KEY:-}
TELNYX_VERIFY_API_URL=\${TELNYX_VERIFY_API_URL:-https://api.telnyx.com/v2/verify}

# Sinch Configuration
SINCH_API_KEY=\${SINCH_API_KEY:-}
SINCH_API_SECRET=\${SINCH_API_SECRET:-}

# Mailgun Configuration
MAILGUN_API_KEY=\${MAILGUN_API_KEY:-}
MAILGUN_DOMAIN=\${MAILGUN_DOMAIN:-}

# Stripe Configuration
STRIPE_SECRET_KEY=\${STRIPE_SECRET_KEY:-}
STRIPE_PUBLISHABLE_KEY=\${STRIPE_PUBLISHABLE_KEY:-}

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=json
EOF

        # Create Docker Compose file
        cat > docker-compose.production.yml << 'EOF'
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
      - \"8080:8080\"
    healthcheck:
      test: [\"CMD\", \"curl\", \"-f\", \"http://localhost:8080/\"]
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
      - \"80:80\"
      - \"443:443\"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - tetrix-app
EOF

        # Create Nginx configuration
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
        add_header X-XSS-Protection \"1; mode=block\";
        add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains\" always;
        
        # Gzip compression
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
        
        # Main application proxy
        location / {
            proxy_pass http://tetrix_app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }
        
        # Health check endpoint
        location /health {
            access_log off;
            return 200 \"healthy\\n\";
            add_header Content-Type text/plain;
        }
    }
}
EOF
    "
    
    print_success "Application setup completed on droplet"
}

# Setup Docker on droplet
setup_docker() {
    print_status "Setting up Docker on droplet..."
    
    doctl compute ssh "$DROPLET_NAME" --ssh-key-path "$SSH_KEY_PATH" --ssh-command "
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
            curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose
            chmod +x /usr/local/bin/docker-compose
        fi
        
        # Create docker network
        docker network create tetrix-network 2>/dev/null || true
    "
    
    print_success "Docker setup completed"
}

# Deploy application on droplet
deploy_application() {
    print_status "Deploying application on droplet..."
    
    doctl compute ssh "$DROPLET_NAME" --ssh-key-path "$SSH_KEY_PATH" --ssh-command "
        cd $APP_DIR
        
        # Stop existing containers
        docker-compose -f docker-compose.production.yml down 2>/dev/null || true
        
        # Build and start new containers
        docker-compose -f docker-compose.production.yml up -d --build
        
        # Wait for services to be ready
        echo \"Waiting for services to start...\"
        sleep 30
        
        # Check container status
        docker-compose -f docker-compose.production.yml ps
    "
    
    print_success "Application deployed successfully"
}

# Verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Check if application is responding
    if curl -f http://$DROPLET_IP:8080/ > /dev/null 2>&1; then
        print_success "Application is responding on port 8080"
    else
        print_warning "Application may not be fully ready yet"
    fi
    
    # Check container status
    doctl compute ssh "$DROPLET_NAME" --ssh-key-path "$SSH_KEY_PATH" --ssh-command "
        cd $APP_DIR
        echo \"=== Container Status ===\"
        docker-compose -f docker-compose.production.yml ps
        
        echo \"=== Container Logs (last 20 lines) ===\"
        docker-compose -f docker-compose.production.yml logs --tail=20
    "
    
    print_success "Deployment verification completed"
}

# Clean up
cleanup() {
    print_status "Cleaning up temporary files..."
    rm -f /tmp/tetrix-deployment.tar.gz
    print_success "Cleanup completed"
}

# Main deployment function
main() {
    echo "🚀 TETRIX Deployment using doctl with correct SSH key"
    echo "===================================================="
    echo "Droplet: $DROPLET_NAME"
    echo "IP Address: $DROPLET_IP"
    echo "App Directory: $APP_DIR"
    echo "SSH Key: $SSH_KEY_PATH"
    echo "===================================================="
    
    check_doctl
    get_droplet_info
    check_droplet_status
    test_ssh_connection
    create_deployment_package
    upload_package
    setup_application
    setup_docker
    deploy_application
    verify_deployment
    cleanup
    
    echo ""
    echo "🎉 TETRIX Production Deployment Completed!"
    echo "=========================================="
    echo "Application URL: http://$DROPLET_IP:8080"
    echo "Health Check: http://$DROPLET_IP:8080/health"
    echo ""
    echo "To check logs: doctl compute ssh $DROPLET_NAME --ssh-key-path $SSH_KEY_PATH 'cd $APP_DIR && docker-compose -f docker-compose.production.yml logs'"
    echo "To restart: doctl compute ssh $DROPLET_NAME --ssh-key-path $SSH_KEY_PATH 'cd $APP_DIR && docker-compose -f docker-compose.production.yml restart'"
    echo "To stop: doctl compute ssh $DROPLET_NAME --ssh-key-path $SSH_KEY_PATH 'cd $APP_DIR && docker-compose -f docker-compose.production.yml down'"
}

# Run main function
main "$@"
