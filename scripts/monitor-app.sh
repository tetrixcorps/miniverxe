#!/bin/bash

# Comprehensive monitoring script for TETRIX production app
# Monitors app health, performance, and provides alerts

set -e

APP_ID="ca96485c-ee6b-401b-b1a2-8442c3bc7f04"
APP_URL="https://tetrix-minimal-uzzxn.ondigitalocean.app"
HEALTH_URL="$APP_URL/api/health"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log with timestamp and color
log() {
    local color=$1
    local message=$2
    echo -e "${color}[$(date '+%Y-%m-%d %H:%M:%S')] $message${NC}"
}

# Function to check app status
check_app_status() {
    log $BLUE "🔍 Checking app status..."
    
    local app_data=$(doctl apps get $APP_ID -o json | jq '.[0]')
    local status=$(echo "$app_data" | jq -r '.active_deployment.phase')
    local instances=$(doctl apps list-instances $APP_ID -o json | jq 'length')
    
    log $BLUE "  Status: $status"
    log $BLUE "  Instances: $instances"
    
    if [ "$status" = "SUCCESS" ] && [ "$instances" -gt 0 ]; then
        log $GREEN "  ✅ App is running normally"
        return 0
    else
        log $RED "  ❌ App has issues"
        return 1
    fi
}

# Function to check health endpoint
check_health() {
    log $BLUE "🏥 Checking health endpoint..."
    
    local response=$(curl -s -w "\n%{http_code}\n%{time_total}" "$HEALTH_URL" || echo -e "\n000\n0")
    local body=$(echo "$response" | head -n -2)
    local status_code=$(echo "$response" | tail -n 2 | head -n 1)
    local response_time=$(echo "$response" | tail -n 1)
    
    if [ "$status_code" = "200" ]; then
        log $GREEN "  ✅ Health check passed (${response_time}s)"
        
        # Parse health data
        local health_status=$(echo "$body" | jq -r '.status // "unknown"')
        local memory_percent=$(echo "$body" | jq -r '.memory.percentage // 0')
        local uptime=$(echo "$body" | jq -r '.uptime // 0')
        
        log $BLUE "  Health Status: $health_status"
        log $BLUE "  Memory Usage: ${memory_percent}%"
        log $BLUE "  Uptime: ${uptime}s"
        
        # Check for degraded status
        if [ "$health_status" = "degraded" ]; then
            log $YELLOW "  ⚠️  App is in degraded state"
        elif [ "$health_status" = "unhealthy" ]; then
            log $RED "  ❌ App is unhealthy"
            return 1
        fi
        
        return 0
    else
        log $RED "  ❌ Health check failed (HTTP $status_code, ${response_time}s)"
        return 1
    fi
}

# Function to check domain status
check_domains() {
    log $BLUE "🌐 Checking domain status..."
    
    local domains=$(doctl apps get $APP_ID -o json | jq -r '.[0].domains[]')
    local active_count=0
    local total_count=0
    
    echo "$domains" | jq -r '.spec.domain + ":" + .phase' | while IFS=':' read -r domain phase; do
        total_count=$((total_count + 1))
        if [ "$phase" = "ACTIVE" ]; then
            active_count=$((active_count + 1))
            log $GREEN "  ✅ $domain ($phase)"
        else
            log $YELLOW "  ⚠️  $domain ($phase)"
        fi
    done
    
    log $BLUE "  Active domains: $active_count/$total_count"
}

# Function to check performance
check_performance() {
    log $BLUE "⚡ Checking performance..."
    
    # Test main page
    local main_response=$(curl -s -w "\n%{time_total}" -o /dev/null "$APP_URL" || echo -e "\n0")
    local main_time=$(echo "$main_response" | tail -n 1)
    
    # Test API endpoint
    local api_response=$(curl -s -w "\n%{time_total}" -o /dev/null "$APP_URL/api/health" || echo -e "\n0")
    local api_time=$(echo "$api_response" | tail -n 1)
    
    log $BLUE "  Main page response time: ${main_time}s"
    log $BLUE "  API response time: ${api_time}s"
    
    # Performance thresholds
    if (( $(echo "$main_time > 3.0" | bc -l) )); then
        log $YELLOW "  ⚠️  Main page is slow (>3s)"
    fi
    
    if (( $(echo "$api_time > 1.0" | bc -l) )); then
        log $YELLOW "  ⚠️  API is slow (>1s)"
    fi
}

# Function to check resource usage
check_resources() {
    log $BLUE "💾 Checking resource usage..."
    
    local instances=$(doctl apps list-instances $APP_ID -o json)
    local total_instances=$(echo "$instances" | jq 'length')
    
    log $BLUE "  Total instances: $total_instances"
    
    # Check each instance
    echo "$instances" | jq -r '.[] | .instance_alias + ":" + .phase' | while IFS=':' read -r instance phase; do
        if [ "$phase" = "RUNNING" ]; then
            log $GREEN "  ✅ $instance ($phase)"
        else
            log $YELLOW "  ⚠️  $instance ($phase)"
        fi
    done
}

# Function to show recent logs
show_recent_logs() {
    log $BLUE "📋 Recent logs (last 10 lines)..."
    
    local logs=$(doctl apps logs $APP_ID --type run --tail 10 2>/dev/null || echo "No logs available")
    echo "$logs" | while IFS= read -r line; do
        if [[ "$line" == *"ERROR"* ]] || [[ "$line" == *"FATAL"* ]]; then
            log $RED "  $line"
        elif [[ "$line" == *"WARN"* ]]; then
            log $YELLOW "  $line"
        else
            log $BLUE "  $line"
        fi
    done
}

# Function to generate report
generate_report() {
    log $BLUE "📊 Generating monitoring report..."
    
    local report_file="monitoring-report-$(date +%Y%m%d-%H%M%S).txt"
    
    {
        echo "TETRIX Production Monitoring Report"
        echo "Generated: $(date)"
        echo "=================================="
        echo ""
        
        echo "App Status:"
        doctl apps get $APP_ID -o json | jq -r '.[0] | "  ID: " + .id + "\n  Name: " + .spec.name + "\n  Status: " + .active_deployment.phase'
        echo ""
        
        echo "Instances:"
        doctl apps list-instances $APP_ID -o json | jq -r '.[] | "  " + .instance_alias + ": " + .phase'
        echo ""
        
        echo "Domains:"
        doctl apps get $APP_ID -o json | jq -r '.[0].domains[] | "  " + .spec.domain + ": " + .phase'
        echo ""
        
        echo "Health Check:"
        curl -s "$HEALTH_URL" | jq '.' 2>/dev/null || echo "  Health check failed"
        echo ""
        
    } > "$report_file"
    
    log $GREEN "  ✅ Report saved to: $report_file"
}

# Main monitoring function
main() {
    log $BLUE "🚀 Starting TETRIX Production Monitoring"
    log $BLUE "========================================"
    
    local overall_status=0
    
    # Run all checks
    check_app_status || overall_status=1
    echo ""
    
    check_health || overall_status=1
    echo ""
    
    check_domains
    echo ""
    
    check_performance
    echo ""
    
    check_resources
    echo ""
    
    show_recent_logs
    echo ""
    
    # Generate report
    generate_report
    echo ""
    
    # Final status
    if [ $overall_status -eq 0 ]; then
        log $GREEN "🎉 All systems operational!"
    else
        log $RED "❌ Issues detected - check the report above"
    fi
    
    return $overall_status
}

# Handle command line arguments
case "${1:-monitor}" in
    "monitor")
        main
        ;;
    "health")
        check_health
        ;;
    "status")
        check_app_status
        ;;
    "performance")
        check_performance
        ;;
    "logs")
        show_recent_logs
        ;;
    "report")
        generate_report
        ;;
    *)
        echo "Usage: $0 [monitor|health|status|performance|logs|report]"
        exit 1
        ;;
esac
