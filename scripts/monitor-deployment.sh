#!/bin/bash

# TETRIX Deployment Monitoring Script
# This script monitors the health and status of all services

set -e

echo "🔍 TETRIX DEPLOYMENT MONITORING"
echo "================================"
echo "Timestamp: $(date)"
echo ""

# Function to check service health
check_service() {
    local service_name="$1"
    local health_check="$2"
    
    echo "📊 Checking $service_name..."
    if eval "$health_check" > /dev/null 2>&1; then
        echo "   ✅ $service_name: HEALTHY"
        return 0
    else
        echo "   ❌ $service_name: UNHEALTHY"
        return 1
    fi
}

# Function to get container status
get_container_status() {
    local container_name="$1"
    docker inspect --format='{{.State.Status}}' "$container_name" 2>/dev/null || echo "not_found"
}

# Function to get container health
get_container_health() {
    local container_name="$1"
    docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "no_health_check"
}

echo "🐳 CONTAINER STATUS"
echo "-------------------"
containers=("tetrix-app" "tetrix-nginx" "tetrix-postgres" "tetrix-redis")

for container in "${containers[@]}"; do
    status=$(get_container_status "$container")
    health=$(get_container_health "$container")
    echo "   $container: $status (health: $health)"
done

echo ""
echo "🌐 APPLICATION HEALTH CHECKS"
echo "-----------------------------"

# Check main application
check_service "Main Application" "curl -f http://localhost:8080" || true

# Check Nginx proxy
check_service "Nginx Proxy" "curl -f http://localhost" || true

# Check PostgreSQL
check_service "PostgreSQL Database" "docker exec tetrix-postgres pg_isready -U tetrix -d tetrix" || true

# Check Redis
check_service "Redis Cache" "docker exec tetrix-redis redis-cli -a tetrix123 ping" || true

echo ""
echo "📈 PERFORMANCE METRICS"
echo "----------------------"

# Get container resource usage
echo "Memory Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep tetrix || echo "No tetrix containers found"

echo ""
echo "🔗 NETWORK CONNECTIVITY"
echo "-----------------------"

# Check port accessibility
ports=("8080:Main App" "80:Nginx" "5433:PostgreSQL" "6379:Redis")
for port_info in "${ports[@]}"; do
    port=$(echo "$port_info" | cut -d: -f1)
    service=$(echo "$port_info" | cut -d: -f2)
    if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
        echo "   ✅ Port $port ($service): LISTENING"
    else
        echo "   ❌ Port $port ($service): NOT LISTENING"
    fi
done

echo ""
echo "📋 RECENT LOGS"
echo "--------------"

# Show recent application logs
echo "Main Application (last 5 lines):"
docker logs tetrix-app --tail 5 2>/dev/null || echo "No logs available"

echo ""
echo "Nginx (last 5 lines):"
docker logs tetrix-nginx --tail 5 2>/dev/null || echo "No logs available"

echo ""
echo "🎯 DEPLOYMENT STATUS SUMMARY"
echo "============================"

# Overall health assessment
healthy_services=0
total_services=4

check_service "Main Application" "curl -f http://localhost:8080" && ((healthy_services++))
check_service "Nginx Proxy" "curl -f http://localhost" && ((healthy_services++))
check_service "PostgreSQL Database" "docker exec tetrix-postgres pg_isready -U tetrix -d tetrix" && ((healthy_services++))
check_service "Redis Cache" "docker exec tetrix-redis redis-cli -a tetrix123 ping" && ((healthy_services++))

echo "Healthy Services: $healthy_services/$total_services"

if [ $healthy_services -eq $total_services ]; then
    echo "🎉 ALL SERVICES HEALTHY - DEPLOYMENT SUCCESSFUL!"
    exit 0
elif [ $healthy_services -ge 3 ]; then
    echo "⚠️  MOSTLY HEALTHY - Minor issues detected"
    exit 1
else
    echo "❌ DEPLOYMENT ISSUES DETECTED - Immediate attention required"
    exit 2
fi
