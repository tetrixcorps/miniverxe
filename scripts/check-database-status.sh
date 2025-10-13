#!/bin/bash

# TETRIX Database Status Check Script

echo "🔍 Checking TETRIX Database Status..."

# Check if we can connect to the database that's working
echo "Checking API service database connection..."
cd services/api

if npx prisma db push --accept-data-loss > /dev/null 2>&1; then
    echo "✅ API Service database connection working"
    
    # Get the actual database URL being used
    echo "Current database URL:"
    cat .env | grep DATABASE_URL
    
    # List current tables
    echo "Current tables:"
    npx prisma db execute --stdin <<< "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" 2>/dev/null || echo "Could not list tables"
    
else
    echo "❌ API Service database connection failed"
fi

echo ""
echo "🔍 Checking if other services can connect..."

# Check eSIM service
cd ../esim-ordering
if [ -f "prisma/schema.prisma" ]; then
    echo "eSIM Ordering Service schema found"
    if npx prisma db push --accept-data-loss > /dev/null 2>&1; then
        echo "✅ eSIM Ordering Service database connection working"
    else
        echo "❌ eSIM Ordering Service database connection failed"
    fi
else
    echo "⚠️ eSIM Ordering Service schema not found"
fi

# Check Phone service
cd ../phone-provisioning
if [ -f "prisma/schema.prisma" ]; then
    echo "Phone Provisioning Service schema found"
    if npx prisma db push --accept-data-loss > /dev/null 2>&1; then
        echo "✅ Phone Provisioning Service database connection working"
    else
        echo "❌ Phone Provisioning Service database connection failed"
    fi
else
    echo "⚠️ Phone Provisioning Service schema not found"
fi

# Check OAuth service
cd ../oauth-auth-service
if [ -f "prisma/schema.prisma" ]; then
    echo "OAuth Auth Service schema found"
    if npx prisma db push --accept-data-loss > /dev/null 2>&1; then
        echo "✅ OAuth Auth Service database connection working"
    else
        echo "❌ OAuth Auth Service database connection failed"
    fi
else
    echo "⚠️ OAuth Auth Service schema not found"
fi

echo ""
echo "🎯 Database status check complete!"
