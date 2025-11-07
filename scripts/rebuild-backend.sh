#!/bin/bash
# Quick rebuild script for backend container
# Use this after making changes to source files

set -e

echo "=========================================="
echo "🔨 Rebuilding Backend Container"
echo "=========================================="
echo ""

# Use explicit image name from docker-compose.yml
IMAGE_NAME="tetrix-backend:latest"

# Get current image ID before rebuild
OLD_IMAGE=$(docker images ${IMAGE_NAME} --format "{{.ID}}" 2>/dev/null || echo "")
echo "📦 Current image ID: ${OLD_IMAGE:0:12}..."

echo ""
echo "[1/6] 🔨 Building new image (this may take 5-10 minutes)..."
docker compose build --no-cache tetrix-backend

# Get new image ID
NEW_IMAGE=$(docker images ${IMAGE_NAME} --format "{{.ID}}" 2>/dev/null || echo "")
echo "📦 New image ID: ${NEW_IMAGE:0:12}..."

if [ "${OLD_IMAGE}" = "${NEW_IMAGE}" ]; then
    echo "⚠️  WARNING: Image ID didn't change - build may have used cache"
fi

echo ""
echo "[2/6] 🛑 Stopping old container..."
docker compose stop tetrix-backend

echo ""
echo "[3/6] 🗑️  Removing old container..."
docker compose rm -f tetrix-backend

echo ""
echo "[4/6] 🚀 Starting new container with new image..."
docker compose up -d tetrix-backend

echo ""
echo "[5/6] ⏳ Waiting for container to start and become healthy..."
sleep 5

# Get container name dynamically
CONTAINER_NAME=$(docker compose ps tetrix-backend --format "{{.Name}}" 2>/dev/null | head -1 || echo "tetrix-tetrix-backend-1")

# Verify container is using the new image
if [ -n "${CONTAINER_NAME}" ]; then
    CONTAINER_IMAGE=$(docker inspect ${CONTAINER_NAME} --format='{{.Image}}' 2>/dev/null | sed 's/sha256://' || echo "")
    
    if [ "${CONTAINER_IMAGE}" = "${NEW_IMAGE}" ]; then
        echo "✅ Container is using the new image"
    else
        echo "⚠️  WARNING: Container image may not match new build"
        echo "   Container: ${CONTAINER_IMAGE:0:12}..."
        echo "   New image: ${NEW_IMAGE:0:12}..."
    fi
else
    echo "⚠️  Could not determine container name"
fi

echo ""
echo "[6/6] ✅ Verifying container health..."
MAX_RETRIES=10
RETRY_COUNT=0
HEALTHY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health 2>/dev/null || echo "000")
    
    if [ "${HTTP_CODE}" = "200" ] || [ "${HTTP_CODE}" = "302" ]; then
        HEALTHY=true
        echo "✅ Container is healthy (HTTP ${HTTP_CODE})"
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "⏳ Waiting for container... (attempt $RETRY_COUNT/$MAX_RETRIES, HTTP ${HTTP_CODE})"
    sleep 2
done

if [ "${HEALTHY}" = "false" ]; then
    echo "⚠️  Container may not be fully healthy yet"
    echo "   Check logs: docker compose logs tetrix-backend"
fi

echo ""
echo "=========================================="
echo "✅ Rebuild Complete!"
echo "=========================================="
echo ""
echo "📊 Container status:"
docker compose ps tetrix-backend

echo ""
echo "📝 Image verification:"
echo "   Built: $(docker images ${IMAGE_NAME} --format '{{.CreatedAt}}')"
echo "   Size: $(docker images ${IMAGE_NAME} --format '{{.Size}}')"
echo "   ID: ${NEW_IMAGE:0:12}..."

echo ""
echo "💡 Useful commands:"
echo "   🔍 View logs: docker compose logs -f tetrix-backend"
echo "   🌐 Test: http://localhost:3000/health"
echo "   🔄 Restart: docker compose restart tetrix-backend"
echo ""

