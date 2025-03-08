#!/bin/bash

MODE=$1
ENV_FILE=$2

function check_dependencies() {
    echo "Checking dependencies..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo "Error: Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        echo "Error: Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    }
    
    # Check NVIDIA drivers
    if ! command -v nvidia-smi &> /dev/null; then
        echo "Warning: NVIDIA drivers not found. GPU acceleration will not be available."
    fi
}

function cleanup_containers() {
    echo "Cleaning up existing containers..."
    docker rm -f ml-redis ml-prometheus 2>/dev/null || true
}

function check_ports() {
    echo "Checking if required ports are available..."
    
    if lsof -i:8000 >/dev/null 2>&1; then
        echo "Error: Port 8000 is already in use"
        exit 1
    fi
    
    if lsof -i:6379 >/dev/null 2>&1; then
        echo "Error: Port 6379 is already in use"
        exit 1
    fi
    
    if lsof -i:9090 >/dev/null 2>&1; then
        echo "Error: Port 9090 is already in use"
        exit 1
    fi
}

function start_dev() {
    echo "Starting services in development mode..."
    
    # Load environment variables
    if [ -f "$ENV_FILE" ]; then
        export $(cat "$ENV_FILE" | grep -v '^#' | xargs)
    else
        echo "Warning: Environment file not found, using defaults"
    fi
    
    # Create required directories
    mkdir -p ./model_cache ./logs
    
    # Cleanup existing containers
    cleanup_containers
    
    # Check ports
    check_ports
    
    echo "Starting Redis..."
    docker run -d \
        --name ml-redis \
        -p 6379:6379 \
        redis:alpine
    
    echo "Starting Prometheus..."
    docker run -d \
        --name ml-prometheus \
        -p 9090:9090 \
        -v $(pwd)/config/prometheus.yml:/etc/prometheus/prometheus.yml \
        prom/prometheus
    
    echo "Starting API Gateway..."
    CUDA_VISIBLE_DEVICES=${CUDA_VISIBLE_DEVICES:-0} \
    MODEL_CACHE_DIR=${MODEL_CACHE_DIR:-./model_cache} \
    REDIS_URL=${REDIS_URL:-redis://localhost:6379} \
    PROMETHEUS_URL=${PROMETHEUS_URL:-http://localhost:9090} \
    uvicorn app.services.api_gateway.app:app \
        --host 0.0.0.0 \
        --port ${API_PORT:-8000} \
        --reload \
        --log-level ${LOG_LEVEL:-debug}
}

function start_prod() {
    echo "Starting services in production mode..."
    
    if [ ! -f "docker-compose.yml" ]; then
        echo "Error: docker-compose.yml not found"
        exit 1
    fi
    
    if [ -f "$ENV_FILE" ]; then
        export $(cat "$ENV_FILE" | grep -v '^#' | xargs)
    else
        echo "Error: Production environment file required"
        exit 1
    fi
    
    docker-compose up -d --build
    
    echo "Waiting for services to start..."
    sleep 5
    
    if ! docker-compose ps | grep -q "Up"; then
        echo "Error: Some services failed to start. Check logs with: docker-compose logs"
        exit 1
    fi
    
    echo "All services started successfully"
}

# Main execution
check_dependencies

case $MODE in
    "dev")
        start_dev
        ;;
    "prod")
        start_prod
        ;;
    *)
        echo "Usage: $0 [dev|prod] [env-file]"
        echo "Example: $0 dev .env.dev"
        exit 1
        ;;
esac 