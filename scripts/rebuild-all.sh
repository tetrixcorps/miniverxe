#!/bin/bash
# Rebuild both frontend and backend containers
# Use this for full deployment after code changes

set -e

echo "=========================================="
echo "🔨 Rebuilding All Services"
echo "=========================================="
echo ""
echo "This will rebuild both frontend and backend containers."
echo "This may take 10-20 minutes total."
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
fi

echo ""
echo "=========================================="
echo "📦 Step 1: Rebuilding Backend"
echo "=========================================="
echo ""
bash scripts/rebuild-backend.sh

echo ""
echo "=========================================="
echo "📦 Step 2: Rebuilding Frontend"
echo "=========================================="
echo ""
bash scripts/rebuild-frontend.sh

echo ""
echo "=========================================="
echo "✅ All Services Rebuilt Successfully!"
echo "=========================================="
echo ""
echo "📊 All container status:"
docker compose ps

echo ""
echo "💡 Service URLs:"
echo "   🌐 Frontend: http://localhost:8082"
echo "   🔧 Backend: http://localhost:3000/health"
echo "   📊 Redis: localhost:6379"
echo ""
echo "💡 Useful commands:"
echo "   🔍 View all logs: docker compose logs -f"
echo "   🔍 Frontend logs: docker compose logs -f tetrix-frontend"
echo "   🔍 Backend logs: docker compose logs -f tetrix-backend"
echo "   🔄 Restart all: docker compose restart"
echo ""

