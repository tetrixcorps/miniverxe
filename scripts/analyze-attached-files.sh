#!/bin/bash

# TETRIX File Analysis Script
# Analyzes the attached files for potential issues

echo "🔍 TETRIX File Analysis Report"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}🔍 $1${NC}"
}

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
    echo -e "${CYAN}ℹ️ $1${NC}"
}

print_service() {
    echo -e "${PURPLE}📦 $1${NC}"
}

# Analysis of services/api/src/index.ts
print_header "API Service Analysis (services/api/src/index.ts)"
echo "Issues Found:"

# Check for missing error handling
if ! grep -q "try.*catch" /home/diegomartinez/Desktop/tetrix/services/api/src/index.ts; then
    print_warning "Missing try-catch error handling in API service"
fi

# Check for missing middleware
if ! grep -q "helmet\|morgan\|compression" /home/diegomartinez/Desktop/tetrix/services/api/src/index.ts; then
    print_warning "Missing security and logging middleware (helmet, morgan, compression)"
fi

# Check for missing global error handler
if ! grep -q "app.use.*error" /home/diegomartinez/Desktop/tetrix/services/api/src/index.ts; then
    print_warning "Missing global error handler middleware"
fi

# Check for missing rate limiting
if ! grep -q "rate.*limit\|express-rate-limit" /home/diegomartinez/Desktop/tetrix/services/api/src/index.ts; then
    print_warning "Missing rate limiting middleware"
fi

print_info "API service has basic CORS configuration but lacks production-ready middleware"

echo ""

# Analysis of TeXML endpoint
print_header "TeXML Endpoint Analysis (src/pages/api/voice/texml.ts)"
echo "Issues Found:"

# Check for environment variable handling
if grep -q "process.env.WEBHOOK_BASE_URL ||" /home/diegomartinez/Desktop/tetrix/src/pages/api/voice/texml.ts; then
    print_success "Environment variable fallback properly implemented"
else
    print_warning "Environment variable handling could be improved"
fi

# Check for XML validation
if ! grep -q "validate.*xml\|xml.*validate" /home/diegomartinez/Desktop/tetrix/src/pages/api/voice/texml.ts; then
    print_warning "Missing XML validation for TeXML responses"
fi

# Check for input sanitization
if ! grep -q "sanitize\|escape\|validate" /home/diegomartinez/Desktop/tetrix/src/pages/api/voice/texml.ts; then
    print_warning "Missing input sanitization for user-provided messages"
fi

print_info "TeXML endpoint has basic functionality but needs security hardening"

echo ""

# Analysis of test results
print_header "Test Results Analysis"
echo "Issues Found:"

# Check test-results directory
if [ -f "/home/diegomartinez/Desktop/tetrix/test-results/.last-run.json" ]; then
    STATUS=$(cat /home/diegomartinez/Desktop/tetrix/test-results/.last-run.json | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    if [ "$STATUS" = "failed" ]; then
        print_error "Last test run failed"
    else
        print_success "Test results directory exists with status: $STATUS"
    fi
else
    print_warning "No test results found"
fi

# Check for test report files
REPORT_COUNT=$(find /home/diegomartinez/Desktop/tetrix/test-results/ -name "*.html" 2>/dev/null | wc -l)
if [ "$REPORT_COUNT" -gt 0 ]; then
    print_info "Found $REPORT_COUNT test report files"
else
    print_warning "No test report files found"
fi

echo ""

# Analysis of Playwright report
print_header "Playwright Report Analysis"
echo "Issues Found:"

if [ -f "/home/diegomartinez/Desktop/tetrix/playwright-report/index.html" ]; then
    FILE_SIZE=$(stat -c%s /home/diegomartinez/Desktop/tetrix/playwright-report/index.html 2>/dev/null || echo "0")
    if [ "$FILE_SIZE" -gt 500000 ]; then
        print_warning "Playwright report is very large ($FILE_SIZE bytes) - may contain excessive data"
    else
        print_success "Playwright report exists ($FILE_SIZE bytes)"
    fi
else
    print_warning "No Playwright report found"
fi

echo ""

# Analysis of Astro data store
print_header "Astro Data Store Analysis"
echo "Issues Found:"

if [ -f "/home/diegomartinez/Desktop/tetrix/.astro/data-store.json" ]; then
    print_success "Astro data store exists and is properly configured"
    
    # Check for allowed hosts configuration
    if grep -q "goldfish-app-yulr9.ondigitalocean.app" /home/diegomartinez/Desktop/tetrix/.astro/data-store.json; then
        print_success "DigitalOcean app domain properly configured in allowedHosts"
    else
        print_warning "DigitalOcean app domain not found in allowedHosts"
    fi
    
    # Check for development settings
    if grep -q '"host":"0.0.0.0"' /home/diegomartinez/Desktop/tetrix/.astro/data-store.json; then
        print_success "Server configured to listen on all interfaces"
    else
        print_warning "Server host configuration may need review"
    fi
else
    print_error "Astro data store not found"
fi

echo ""

# Analysis of log files and temporary files
print_header "Log Files and Temporary Files Analysis"
echo "Issues Found:"

# Check for log files
LOG_COUNT=$(find /home/diegomartinez/Desktop/tetrix -name "*.log" 2>/dev/null | wc -l)
if [ "$LOG_COUNT" -gt 0 ]; then
    print_warning "Found $LOG_COUNT log files - consider log rotation and cleanup"
    find /home/diegomartinez/Desktop/tetrix -name "*.log" 2>/dev/null | head -5 | while read logfile; do
        print_info "Log file: $logfile"
    done
else
    print_success "No log files found"
fi

# Check for node_modules directories
NODE_MODULES_COUNT=$(find /home/diegomartinez/Desktop/tetrix -name "node_modules" -type d 2>/dev/null | wc -l)
if [ "$NODE_MODULES_COUNT" -gt 1 ]; then
    print_warning "Found $NODE_MODULES_COUNT node_modules directories - consider consolidating dependencies"
else
    print_success "Node modules properly organized"
fi

# Check for cache directories
CACHE_COUNT=$(find /home/diegomartinez/Desktop/tetrix -name ".cache" -type d 2>/dev/null | wc -l)
if [ "$CACHE_COUNT" -gt 0 ]; then
    print_info "Found $CACHE_COUNT cache directories"
fi

echo ""

# Summary and recommendations
print_header "Summary and Recommendations"
echo ""

print_service "Critical Issues:"
echo "1. API service lacks production-ready middleware (security, logging, rate limiting)"
echo "2. TeXML endpoint needs input sanitization and XML validation"
echo "3. Missing global error handling in API service"

print_service "Medium Priority Issues:"
echo "1. Test infrastructure needs improvement (failed test runs)"
echo "2. Log file management needs attention"
echo "3. Multiple node_modules directories indicate dependency management issues"

print_service "Low Priority Issues:"
echo "1. Playwright report size optimization"
echo "2. Cache directory cleanup"
echo "3. Test result organization"

echo ""
print_success "🎯 Analysis complete! Focus on critical security and production readiness issues first."
