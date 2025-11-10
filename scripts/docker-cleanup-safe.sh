#!/bin/bash

# Safe Docker cleanup script - Only removes unused images and build cache
# Preserves images needed for production docker-compose environment

set -e

echo "=========================================="
echo "SAFE DOCKER CLEANUP"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get images used by docker-compose
echo -e "${BLUE}=== Identifying images used by docker-compose ===${NC}"
COMPOSE_IMAGES=$(docker-compose config 2>/dev/null | grep -E "^\s*image:" | awk '{print $2}' | sort -u || docker compose config 2>/dev/null | grep -E "^\s*image:" | awk '{print $2}' | sort -u || echo "")

# Get project name and service names to identify built images
PROJECT_NAME=$(docker-compose config 2>/dev/null | grep -E "^name:" | awk '{print $2}' || basename $(pwd) | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]//g' || echo "tetrix")
SERVICE_NAMES=$(docker-compose config 2>/dev/null | grep -E "^\s+[a-z-]+:" | grep -v "version:" | awk '{print $1}' | sed 's/://' | sort -u || echo "")

# Get built images (from build: directives)
BUILT_IMAGES=""
if [ -n "$SERVICE_NAMES" ]; then
    for service in $SERVICE_IMAGES; do
        # Check for images with project name prefix
        BUILT_IMAGES="$BUILT_IMAGES\n${PROJECT_NAME}-${service}"
        BUILT_IMAGES="$BUILT_IMAGES\n${PROJECT_NAME}_${service}"
    done
fi

# Also check for explicitly named images from docker-compose
if [ -n "$COMPOSE_IMAGES" ]; then
    echo "Images explicitly referenced in docker-compose.yml:"
    echo "$COMPOSE_IMAGES" | sed 's/^/  - /'
fi

# Get images from running/stopped containers in the compose project
COMPOSE_CONTAINER_IMAGES=$(docker ps -a --filter "label=com.docker.compose.project=${PROJECT_NAME}" --format "{{.Image}}" 2>/dev/null | sort -u || echo "")
if [ -n "$COMPOSE_CONTAINER_IMAGES" ]; then
    echo "Images used by docker-compose containers:"
    echo "$COMPOSE_CONTAINER_IMAGES" | sed 's/^/  - /'
    COMPOSE_IMAGES="$COMPOSE_IMAGES\n$COMPOSE_CONTAINER_IMAGES"
fi

# Get images used by running containers
echo ""
echo -e "${BLUE}=== Identifying images used by running containers ===${NC}"
RUNNING_IMAGES=$(docker ps --format "{{.Image}}" | sort -u)
if [ -n "$RUNNING_IMAGES" ]; then
    echo "Images used by running containers:"
    echo "$RUNNING_IMAGES" | sed 's/^/  - /'
else
    echo "  (No running containers)"
fi

# Combine all images to preserve
PRESERVE_IMAGES=$(echo -e "$COMPOSE_IMAGES\n$RUNNING_IMAGES" | grep -v "^$" | sort -u)
echo ""
echo -e "${GREEN}=== Images to preserve ===${NC}"
if [ -n "$PRESERVE_IMAGES" ]; then
    echo "$PRESERVE_IMAGES" | sed 's/^/  - /'
else
    echo "  (No images to preserve)"
fi

echo ""
echo -e "${YELLOW}=== Current Docker disk usage ===${NC}"
docker system df

echo ""
echo -e "${YELLOW}=== Step 1: Removing dangling images ===${NC}"
echo "Dangling images are untagged images not referenced by any container"
DANGLING_COUNT=$(docker images -f "dangling=true" -q | wc -l)
if [ "$DANGLING_COUNT" -gt 0 ]; then
    echo "Found $DANGLING_COUNT dangling image(s)"
    docker image prune -f
    echo -e "${GREEN}✅ Dangling images removed${NC}"
else
    echo "No dangling images found"
fi

echo ""
echo -e "${YELLOW}=== Step 2: Removing unused images (not in use by containers) ===${NC}"
echo "This will remove images that are not currently used by any container"
echo "Images referenced in docker-compose.yml will be preserved"

# Get all images
ALL_IMAGES=$(docker images --format "{{.Repository}}:{{.Tag}}" | grep -v "<none>")

# Get images used by any container (running or stopped)
USED_IMAGES=$(docker ps -a --format "{{.Image}}" | sort -u)

# Find unused images (not in preserve list and not used by containers)
UNUSED_IMAGES=""
while IFS= read -r img; do
    # Skip if image is in preserve list
    if echo -e "$PRESERVE_IMAGES" | grep -q "^$img$"; then
        continue
    fi
    # Skip if image is used by any container
    if echo "$USED_IMAGES" | grep -q "^$img$"; then
        continue
    fi
    # Skip if image matches project/service pattern
    if echo "$img" | grep -qE "^${PROJECT_NAME}-|^${PROJECT_NAME}_"; then
        # Check if it matches a service name
        MATCHED=false
        for service in $SERVICE_NAMES; do
            if echo "$img" | grep -qE "${PROJECT_NAME}-${service}|${PROJECT_NAME}_${service}"; then
                MATCHED=true
                break
            fi
        done
        if [ "$MATCHED" = true ]; then
            continue
        fi
    fi
    UNUSED_IMAGES="$UNUSED_IMAGES\n$img"
done <<< "$ALL_IMAGES"

# Remove leading newline
UNUSED_IMAGES=$(echo -e "$UNUSED_IMAGES" | grep -v "^$")

if [ -n "$UNUSED_IMAGES" ]; then
    UNUSED_COUNT=$(echo "$UNUSED_IMAGES" | wc -l)
    echo "Found $UNUSED_COUNT unused image(s) to remove:"
    echo "$UNUSED_IMAGES" | head -20 | sed 's/^/  - /'
    if [ "$UNUSED_COUNT" -gt 20 ]; then
        echo "  ... and $((UNUSED_COUNT - 20)) more"
    fi
    echo ""
    read -p "Remove these unused images? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "$UNUSED_IMAGES" | xargs -r docker rmi -f 2>/dev/null || echo "Some images could not be removed (may be in use)"
        echo -e "${GREEN}✅ Unused images removed${NC}"
    else
        echo "Skipped removing unused images"
    fi
else
    echo "No unused images found (all images are in use)"
fi

echo ""
echo -e "${YELLOW}=== Step 3: Pruning build cache ===${NC}"
echo "This will remove build cache that is not currently in use"
BUILD_CACHE_SIZE=$(docker system df | grep "Build Cache" | awk '{print $4}')
echo "Current build cache size: $BUILD_CACHE_SIZE"
echo ""
read -p "Prune build cache? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker builder prune -f
    echo -e "${GREEN}✅ Build cache pruned${NC}"
else
    echo "Skipped pruning build cache"
fi

echo ""
echo -e "${YELLOW}=== Step 4: Pruning unused volumes ===${NC}"
echo "This will remove volumes not used by any container"
UNUSED_VOLUMES=$(docker volume ls -q -f dangling=true | wc -l)
if [ "$UNUSED_VOLUMES" -gt 0 ]; then
    echo "Found $UNUSED_VOLUMES unused volume(s)"
    read -p "Remove unused volumes? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker volume prune -f
        echo -e "${GREEN}✅ Unused volumes removed${NC}"
    else
        echo "Skipped removing unused volumes"
    fi
else
    echo "No unused volumes found"
fi

echo ""
echo -e "${GREEN}=== Final Docker disk usage ===${NC}"
docker system df

echo ""
echo -e "${GREEN}=== Cleanup complete! ===${NC}"
echo ""
echo "Summary:"
echo "  - Dangling images: Removed"
echo "  - Unused images: Removed (if confirmed)"
echo "  - Build cache: Pruned (if confirmed)"
echo "  - Unused volumes: Removed (if confirmed)"
echo ""
echo "Images preserved for production:"
if [ -n "$PRESERVE_IMAGES" ]; then
    echo "$PRESERVE_IMAGES" | sed 's/^/  - /'
else
    echo "  (None identified)"
fi

