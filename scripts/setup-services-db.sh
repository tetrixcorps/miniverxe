#!/bin/bash

# TETRIX Services Database Setup Script
# This script sets up database schemas for all services using existing database

set -e

echo "🚀 Setting up TETRIX Services Database Schemas..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

# Check if database is accessible
print_status "Checking database connection..."
if psql "postgresql://diegomartinez:password@localhost:5432/tetrix_dev?schema=public" -c "SELECT 1;" > /dev/null 2>&1; then
    print_success "Database connection successful"
else
    print_error "Cannot connect to database. Please check your PostgreSQL setup."
    exit 1
fi

# Setup eSIM Ordering Service Database
print_status "Setting up eSIM Ordering Service database..."
cd services/esim-ordering
if [ -f "prisma/schema.prisma" ]; then
    npx prisma db push --accept-data-loss
    npx prisma generate
    print_success "eSIM Ordering Service database setup complete"
else
    print_warning "eSIM Ordering Service schema not found"
fi

# Setup Phone Provisioning Service Database
print_status "Setting up Phone Provisioning Service database..."
cd ../phone-provisioning
if [ -f "prisma/schema.prisma" ]; then
    npx prisma db push --accept-data-loss
    npx prisma generate
    print_success "Phone Provisioning Service database setup complete"
else
    print_warning "Phone Provisioning Service schema not found"
fi

# Setup OAuth Auth Service Database
print_status "Setting up OAuth Auth Service database..."
cd ../oauth-auth-service
if [ -f "prisma/schema.prisma" ]; then
    npx prisma db push --accept-data-loss
    npx prisma generate
    print_success "OAuth Auth Service database setup complete"
else
    print_warning "OAuth Auth Service schema not found"
fi

# List all tables
print_status "Listing all database tables..."
cd ../..
psql "postgresql://diegomartinez:password@localhost:5432/tetrix_dev?schema=public" -c "\dt" | grep -E "^\s*[a-zA-Z]" | while read line; do
    print_success "Table: $line"
done

print_success "🎉 All TETRIX Services database schemas setup complete!"
print_status "You can now run the services with their respective database connections."
