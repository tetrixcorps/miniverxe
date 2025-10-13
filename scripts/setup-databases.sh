#!/bin/bash

# TETRIX Services Database Setup Script
# This script sets up databases and migrations for all services

set -e

echo "🚀 Setting up TETRIX Services Databases..."

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

# Check if PostgreSQL is running
print_status "Checking PostgreSQL connection..."
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    print_error "PostgreSQL is not running. Please start PostgreSQL first."
    exit 1
fi
print_success "PostgreSQL is running"

# Check if database exists
print_status "Checking database 'tetrix_dev'..."
if psql -h localhost -U diegomartinez -d tetrix_dev -c "SELECT 1;" > /dev/null 2>&1; then
    print_success "Database 'tetrix_dev' exists"
else
    print_warning "Database 'tetrix_dev' does not exist. Creating..."
    createdb -h localhost -U diegomartinez tetrix_dev
    print_success "Database 'tetrix_dev' created"
fi

# Setup API Service Database
print_status "Setting up API Service database..."
cd services/api
if [ -f "prisma/schema.prisma" ]; then
    npx prisma db push --accept-data-loss
    npx prisma generate
    print_success "API Service database setup complete"
else
    print_warning "API Service schema not found"
fi

# Setup eSIM Ordering Service Database
print_status "Setting up eSIM Ordering Service database..."
cd ../esim-ordering
if [ -f "prisma/schema.prisma" ]; then
    npx prisma db push
    npx prisma generate
    print_success "eSIM Ordering Service database setup complete"
else
    print_warning "eSIM Ordering Service schema not found"
fi

# Setup Phone Provisioning Service Database
print_status "Setting up Phone Provisioning Service database..."
cd ../phone-provisioning
if [ -f "prisma/schema.prisma" ]; then
    npx prisma db push
    npx prisma generate
    print_success "Phone Provisioning Service database setup complete"
else
    print_warning "Phone Provisioning Service schema not found"
fi

# Setup OAuth Auth Service Database
print_status "Setting up OAuth Auth Service database..."
cd ../oauth-auth-service
if [ -f "prisma/schema.prisma" ]; then
    npx prisma db push
    npx prisma generate
    print_success "OAuth Auth Service database setup complete"
else
    print_warning "OAuth Auth Service schema not found"
fi

# List all tables
print_status "Listing all database tables..."
cd ../..
psql -h localhost -U diegomartinez -d tetrix_dev -c "\dt" | grep -E "^\s*[a-zA-Z]" | while read line; do
    print_success "Table: $line"
done

print_success "🎉 All TETRIX Services databases setup complete!"
print_status "You can now run the services with their respective database connections."
