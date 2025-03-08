#!/bin/bash

# Check if running in development mode
if [ "$1" = "dev" ]; then
    # Start services individually
    echo "Starting services in development mode..."
    
    # Start Redis
    redis-server &
    
    # Start Prometheus
    prometheus --config.file=config/prometheus.yml &
    
    # Start API Gateway
    CUDA_VISIBLE_DEVICES=0 \
    MODEL_CACHE_DIR=./model_cache \
    REDIS_URL=redis://localhost:6379 \
    PROMETHEUS_URL=http://localhost:9090 \
    uvicorn app.services.api_gateway.app:app --host 0.0.0.0 --port 8000 --reload
else
    # Start using Docker Compose
    echo "Starting services using Docker Compose..."
    docker-compose up --build
fi 