#!/bin/bash

# TETRIX Production Readiness Report
# Comprehensive analysis of security and production readiness

echo "🚀 TETRIX Production Readiness Report"
echo "====================================="
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

# Security Analysis
print_header "Security Analysis"

# Check for security middleware
if [ -f "/home/diegomartinez/Desktop/tetrix/services/api/src/middleware/security.ts" ]; then
    print_success "Security middleware implemented"
    
    # Check for specific security features
    if grep -q "helmet" /home/diegomartinez/Desktop/tetrix/services/api/src/middleware/security.ts; then
        print_success "Helmet security headers configured"
    else
        print_warning "Helmet configuration missing"
    fi
    
    if grep -q "rateLimit" /home/diegomartinez/Desktop/tetrix/services/api/src/middleware/security.ts; then
        print_success "Rate limiting implemented"
    else
        print_warning "Rate limiting missing"
    fi
    
    if grep -q "sanitizeInput" /home/diegomartinez/Desktop/tetrix/services/api/src/middleware/security.ts; then
        print_success "Input sanitization implemented"
    else
        print_warning "Input sanitization missing"
    fi
else
    print_error "Security middleware not found"
fi

echo ""

# TeXML Security Analysis
print_header "TeXML Endpoint Security"

if [ -f "/home/diegomartinez/Desktop/tetrix/src/pages/api/voice/texml.ts" ]; then
    if grep -q "sanitizeInput" /home/diegomartinez/Desktop/tetrix/src/pages/api/voice/texml.ts; then
        print_success "TeXML input sanitization implemented"
    else
        print_warning "TeXML input sanitization missing"
    fi
    
    if grep -q "validateXML" /home/diegomartinez/Desktop/tetrix/src/pages/api/voice/texml.ts; then
        print_success "TeXML validation implemented"
    else
        print_warning "TeXML validation missing"
    fi
    
    if grep -q "X-Content-Type-Options" /home/diegomartinez/Desktop/tetrix/src/pages/api/voice/texml.ts; then
        print_success "TeXML security headers implemented"
    else
        print_warning "TeXML security headers missing"
    fi
else
    print_error "TeXML endpoint not found"
fi

echo ""

# Database Security Analysis
print_header "Database Security"

# Check for database connection security
if [ -f "/home/diegomartinez/Desktop/tetrix/services/api/src/db.ts" ]; then
    print_success "Database connection file exists"
    
    if grep -q "graceful.*shutdown" /home/diegomartinez/Desktop/tetrix/services/api/src/db.ts; then
        print_success "Database graceful shutdown implemented"
    else
        print_warning "Database graceful shutdown missing"
    fi
else
    print_warning "Database connection file not found"
fi

# Check for environment variables
if [ -f "/home/diegomartinez/Desktop/tetrix/services/api/.env" ]; then
    print_success "Environment variables configured"
    
    if grep -q "DATABASE_URL" /home/diegomartinez/Desktop/tetrix/services/api/.env; then
        print_success "Database URL configured"
    else
        print_warning "Database URL not configured"
    fi
else
    print_warning "Environment file not found"
fi

echo ""

# Logging and Monitoring Analysis
print_header "Logging and Monitoring"

# Check for logging setup
if [ -f "/home/diegomartinez/Desktop/tetrix/services/api/src/middleware/security.ts" ]; then
    if grep -q "winston" /home/diegomartinez/Desktop/tetrix/services/api/src/middleware/security.ts; then
        print_success "Winston logging implemented"
    else
        print_warning "Winston logging missing"
    fi
    
    if grep -q "logger" /home/diegomartinez/Desktop/tetrix/services/api/src/middleware/security.ts; then
        print_success "Logger configured"
    else
        print_warning "Logger configuration missing"
    fi
else
    print_warning "Logging setup not found"
fi

# Check for log management
if [ -f "/home/diegomartinez/Desktop/tetrix/scripts/log-management.sh" ]; then
    print_success "Log management script available"
else
    print_warning "Log management script missing"
fi

echo ""

# Dependency Management Analysis
print_header "Dependency Management"

# Check for package.json security
if [ -f "/home/diegomartinez/Desktop/tetrix/services/api/package.json" ]; then
    if grep -q "helmet" /home/diegomartinez/Desktop/tetrix/services/api/package.json; then
        print_success "Security dependencies installed"
    else
        print_warning "Security dependencies missing"
    fi
    
    if grep -q "express-rate-limit" /home/diegomartinez/Desktop/tetrix/services/api/package.json; then
        print_success "Rate limiting dependency installed"
    else
        print_warning "Rate limiting dependency missing"
    fi
else
    print_error "Package.json not found"
fi

# Check for dependency cleanup
if [ -f "/home/diegomartinez/Desktop/tetrix/scripts/dependency-cleanup.sh" ]; then
    print_success "Dependency cleanup script available"
else
    print_warning "Dependency cleanup script missing"
fi

echo ""

# Performance Analysis
print_header "Performance Analysis"

# Check for compression
if [ -f "/home/diegomartinez/Desktop/tetrix/services/api/src/middleware/security.ts" ]; then
    if grep -q "compression" /home/diegomartinez/Desktop/tetrix/services/api/src/middleware/security.ts; then
        print_success "Compression middleware implemented"
    else
        print_warning "Compression middleware missing"
    fi
else
    print_warning "Performance middleware not found"
fi

# Check for body size limits
if [ -f "/home/diegomartinez/Desktop/tetrix/services/api/src/index.ts" ]; then
    if grep -q "limit.*10mb" /home/diegomartinez/Desktop/tetrix/services/api/src/index.ts; then
        print_success "Body size limits configured"
    else
        print_warning "Body size limits missing"
    fi
else
    print_warning "Main server file not found"
fi

echo ""

# Error Handling Analysis
print_header "Error Handling"

# Check for global error handler
if [ -f "/home/diegomartinez/Desktop/tetrix/services/api/src/index.ts" ]; then
    if grep -q "errorHandler" /home/diegomartinez/Desktop/tetrix/services/api/src/index.ts; then
        print_success "Global error handler implemented"
    else
        print_warning "Global error handler missing"
    fi
    
    if grep -q "404.*handler" /home/diegomartinez/Desktop/tetrix/services/api/src/index.ts; then
        print_success "404 error handler implemented"
    else
        print_warning "404 error handler missing"
    fi
else
    print_warning "Error handling not found"
fi

echo ""

# Production Readiness Summary
print_header "Production Readiness Summary"

# Calculate readiness score
TOTAL_CHECKS=20
PASSED_CHECKS=0

# Security checks
if [ -f "/home/diegomartinez/Desktop/tetrix/services/api/src/middleware/security.ts" ]; then
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
fi

if grep -q "helmet" /home/diegomartinez/Desktop/tetrix/services/api/src/middleware/security.ts 2>/dev/null; then
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
fi

if grep -q "rateLimit" /home/diegomartinez/Desktop/tetrix/services/api/src/middleware/security.ts 2>/dev/null; then
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
fi

if grep -q "sanitizeInput" /home/diegomartinez/Desktop/tetrix/services/api/src/middleware/security.ts 2>/dev/null; then
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
fi

# TeXML security checks
if grep -q "sanitizeInput" /home/diegomartinez/Desktop/tetrix/src/pages/api/voice/texml.ts 2>/dev/null; then
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
fi

if grep -q "validateXML" /home/diegomartinez/Desktop/tetrix/src/pages/api/voice/texml.ts 2>/dev/null; then
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
fi

# Database checks
if [ -f "/home/diegomartinez/Desktop/tetrix/services/api/src/db.ts" ]; then
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
fi

# Logging checks
if grep -q "winston" /home/diegomartinez/Desktop/tetrix/services/api/src/middleware/security.ts 2>/dev/null; then
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
fi

# Performance checks
if grep -q "compression" /home/diegomartinez/Desktop/tetrix/services/api/src/middleware/security.ts 2>/dev/null; then
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
fi

# Error handling checks
if grep -q "errorHandler" /home/diegomartinez/Desktop/tetrix/services/api/src/index.ts 2>/dev/null; then
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
fi

# Calculate percentage
PERCENTAGE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

print_info "Production Readiness Score: $PASSED_CHECKS/$TOTAL_CHECKS ($PERCENTAGE%)"

if [ $PERCENTAGE -ge 90 ]; then
    print_success "🎉 TETRIX is production-ready!"
    print_success "✅ All critical security measures implemented"
    print_success "✅ Performance optimizations in place"
    print_success "✅ Error handling and logging configured"
elif [ $PERCENTAGE -ge 70 ]; then
    print_warning "⚠️ TETRIX is mostly production-ready"
    print_warning "🔧 Some improvements needed before production deployment"
else
    print_error "❌ TETRIX needs significant work before production deployment"
    print_error "🚨 Critical security and performance issues must be addressed"
fi

echo ""
print_service "Next Steps:"
echo "1. Run security tests: ./scripts/security-test.js"
echo "2. Deploy to staging environment"
echo "3. Perform load testing"
echo "4. Set up monitoring and alerting"
echo "5. Deploy to production with confidence"

echo ""
print_success "📊 Production readiness analysis complete!"
