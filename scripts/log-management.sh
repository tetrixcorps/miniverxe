#!/bin/bash

# TETRIX Log Management Script
# Handles log rotation, cleanup, and monitoring

echo "🧹 TETRIX Log Management"
echo "======================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# Create logs directory if it doesn't exist
mkdir -p /home/diegomartinez/Desktop/tetrix/logs

# Log rotation function
rotate_logs() {
    local log_file="$1"
    local max_size="10M"
    local keep_files=5
    
    if [ -f "$log_file" ]; then
        local file_size=$(stat -c%s "$log_file" 2>/dev/null || echo "0")
        local size_mb=$((file_size / 1024 / 1024))
        
        if [ "$size_mb" -gt 10 ]; then
            print_info "Rotating log file: $log_file (${size_mb}MB)"
            
            # Create rotated backup
            for i in $(seq $((keep_files-1)) -1 1); do
                if [ -f "${log_file}.${i}" ]; then
                    mv "${log_file}.${i}" "${log_file}.$((i+1))"
                fi
            done
            
            # Move current log to .1
            mv "$log_file" "${log_file}.1"
            
            # Create new empty log file
            touch "$log_file"
            
            print_success "Log rotated: $log_file"
        else
            print_info "Log file $log_file is ${size_mb}MB (no rotation needed)"
        fi
    fi
}

# Clean up old log files
cleanup_old_logs() {
    local log_dir="$1"
    local keep_days=30
    
    if [ -d "$log_dir" ]; then
        print_info "Cleaning up logs older than $keep_days days in $log_dir"
        
        # Find and remove old log files
        find "$log_dir" -name "*.log.*" -type f -mtime +$keep_days -delete 2>/dev/null
        find "$log_dir" -name "*.log" -type f -mtime +$keep_days -size +100M -delete 2>/dev/null
        
        print_success "Old logs cleaned up"
    fi
}

# Analyze log files
analyze_logs() {
    print_info "Analyzing log files..."
    
    # Find all log files
    local log_files=$(find /home/diegomartinez/Desktop/tetrix -name "*.log" -type f 2>/dev/null)
    local total_size=0
    local file_count=0
    
    for log_file in $log_files; do
        if [ -f "$log_file" ]; then
            local file_size=$(stat -c%s "$log_file" 2>/dev/null || echo "0")
            local size_mb=$((file_size / 1024 / 1024))
            total_size=$((total_size + file_size))
            file_count=$((file_count + 1))
            
            print_info "Log: $log_file (${size_mb}MB)"
        fi
    done
    
    local total_mb=$((total_size / 1024 / 1024))
    print_info "Total log files: $file_count"
    print_info "Total log size: ${total_mb}MB"
    
    if [ "$total_mb" -gt 100 ]; then
        print_warning "Total log size is large (${total_mb}MB) - consider cleanup"
    else
        print_success "Log sizes are within reasonable limits"
    fi
}

# Main execution
echo "Starting log management..."

# Analyze current state
analyze_logs

echo ""

# Rotate large log files
print_info "Checking for log rotation needs..."

# Check main application logs
rotate_logs "/home/diegomartinez/Desktop/tetrix/logs/combined.log"
rotate_logs "/home/diegomartinez/Desktop/tetrix/logs/error.log"

# Check service logs
rotate_logs "/home/diegomartinez/Desktop/tetrix/services/ussd-engine/logs/combined.log"
rotate_logs "/home/diegomartinez/Desktop/tetrix/services/ussd-engine/logs/error.log"

echo ""

# Clean up old logs
print_info "Cleaning up old log files..."
cleanup_old_logs "/home/diegomartinez/Desktop/tetrix/logs"
cleanup_old_logs "/home/diegomartinez/Desktop/tetrix/services/ussd-engine/logs"

echo ""

# Clean up test results and reports
print_info "Cleaning up test artifacts..."

# Clean up old test results (keep last 5)
if [ -d "/home/diegomartinez/Desktop/tetrix/test-results" ]; then
    find /home/diegomartinez/Desktop/tetrix/test-results -name "*.html" -type f -mtime +7 -delete 2>/dev/null
    print_success "Old test reports cleaned up"
fi

# Clean up Playwright reports
if [ -d "/home/diegomartinez/Desktop/tetrix/playwright-report" ]; then
    find /home/diegomartinez/Desktop/tetrix/playwright-report -name "*.html" -type f -mtime +3 -delete 2>/dev/null
    print_success "Old Playwright reports cleaned up"
fi

echo ""

# Clean up cache directories
print_info "Cleaning up cache directories..."

# Clean up node_modules cache
find /home/diegomartinez/Desktop/tetrix -name ".cache" -type d -exec rm -rf {} + 2>/dev/null
find /home/diegomartinez/Desktop/tetrix -name "node_modules/.cache" -type d -exec rm -rf {} + 2>/dev/null

print_success "Cache directories cleaned up"

echo ""

# Final analysis
print_info "Final log analysis..."
analyze_logs

echo ""
print_success "🎉 Log management complete!"
echo ""
echo "📊 Summary:"
echo "- Log rotation completed for large files"
echo "- Old logs cleaned up (30+ days)"
echo "- Test artifacts cleaned up"
echo "- Cache directories cleared"
echo ""
echo "💡 Recommendations:"
echo "- Run this script weekly via cron"
echo "- Monitor log sizes regularly"
echo "- Set up log aggregation for production"
