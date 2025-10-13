#!/bin/bash

# TETRIX Database Status Report
# This script provides a comprehensive report of database status for all services

echo "📊 TETRIX Database Status Report"
echo "================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Check API Service Database
print_header "API Service Database Status"
cd services/api

if [ -f "prisma/schema.prisma" ]; then
    print_success "Prisma schema found"
    
    # Check migration status
    echo "Migration status:"
    npx prisma migrate status 2>/dev/null || print_warning "Migration status check failed"
    
    # List tables
    echo ""
    echo "Current tables:"
    psql $DATABASE_URL -c "\dt" 2>/dev/null | grep -E "^\s*[a-zA-Z]" | while read line; do
        echo "  - $line"
    done
    
    # Check if SHANGO tables exist
    echo ""
    echo "SHANGO Chat tables:"
    psql $DATABASE_URL -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND (table_name LIKE '%chat%' OR table_name LIKE '%shango%');" 2>/dev/null | grep -v "table_name" | while read line; do
        if [ ! -z "$line" ]; then
            echo "  - $line"
        else
            echo "  - No SHANGO chat tables found"
        fi
    done
else
    print_error "Prisma schema not found"
fi

echo ""
print_header "eSIM Ordering Service Database Status"
cd ../esim-ordering

if [ -f "prisma/schema.prisma" ]; then
    print_success "Prisma schema found"
    
    # Check if tables exist
    echo "Checking for eSIM tables:"
    psql $DATABASE_URL -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND (table_name LIKE '%order%' OR table_name LIKE '%esim%' OR table_name LIKE '%payment%');" 2>/dev/null | grep -v "table_name" | while read line; do
        if [ ! -z "$line" ]; then
            echo "  - $line"
        else
            echo "  - No eSIM tables found"
        fi
    done
else
    print_error "Prisma schema not found"
fi

echo ""
print_header "Phone Provisioning Service Database Status"
cd ../phone-provisioning

if [ -f "prisma/schema.prisma" ]; then
    print_success "Prisma schema found"
    
    # Check if tables exist
    echo "Checking for phone tables:"
    psql $DATABASE_URL -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND (table_name LIKE '%phone%' OR table_name LIKE '%porting%' OR table_name LIKE '%provisioning%' OR table_name LIKE '%inventory%');" 2>/dev/null | grep -v "table_name" | while read line; do
        if [ ! -z "$line" ]; then
            echo "  - $line"
        else
            echo "  - No phone tables found"
        fi
    done
else
    print_error "Prisma schema not found"
fi

echo ""
print_header "OAuth Auth Service Database Status"
cd ../oauth-auth-service

if [ -f "prisma/schema.prisma" ]; then
    print_success "Prisma schema found"
    
    # Check if tables exist
    echo "Checking for OAuth tables:"
    psql $DATABASE_URL -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND (table_name LIKE '%user%' OR table_name LIKE '%oauth%' OR table_name LIKE '%token%' OR table_name LIKE '%session%');" 2>/dev/null | grep -v "table_name" | while read line; do
        if [ ! -z "$line" ]; then
            echo "  - $line"
        else
            echo "  - No OAuth tables found"
        fi
    done
else
    print_error "Prisma schema not found"
fi

echo ""
print_header "Database Summary"
echo "Total tables in database:"
psql $DATABASE_URL -c "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | grep -v "table_count" | while read line; do
    echo "  - $line tables"
done

echo ""
print_success "Database status report complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Run migrations for each service to create their tables"
echo "2. Verify all services can connect to their respective tables"
echo "3. Test database operations for each service"
