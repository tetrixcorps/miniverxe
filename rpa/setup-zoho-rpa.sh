#!/bin/bash

# Zoho RPA Agent Setup Script
# This script helps set up the Zoho RPA integration for TETRIX RPA Platform

set -e

echo "🚀 TETRIX Zoho RPA Agent Setup"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -d "src/services" ]; then
    echo "❌ Error: Please run this script from the rpa directory"
    exit 1
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js 18+ first"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cat > .env << 'EOF'
# TETRIX RPA Platform Environment Configuration

# Axiom.ai Integration (Optional)
AXIOM_API_KEY=your_axiom_api_key_here

# Zoho RPA Integration
ZOHO_RPA_CLIENT_ID=your_zoho_rpa_client_id_here
ZOHO_RPA_CLIENT_SECRET=your_zoho_rpa_client_secret_here
ZOHO_RPA_ACCESS_TOKEN=your_zoho_rpa_access_token_here
ZOHO_RPA_REFRESH_TOKEN=your_zoho_rpa_refresh_token_here
ZOHO_RPA_WORKSPACE_ID=your_zoho_rpa_workspace_id_here
ZOHO_RPA_API_BASE_URL=https://rpaapi.zoho.com
ZOHO_RPA_API_VERSION=v1

# RPA Engine Configuration
RPA_MAX_CONCURRENT_EXECUTIONS=10
RPA_DEFAULT_TIMEOUT=30000
RPA_DEFAULT_RETRY_ATTEMPTS=3
RPA_LOGGING_LEVEL=info

# Compliance Settings
ENABLE_COMPLIANCE_MODE=true
ENABLE_AUDIT_LOGGING=true
DATA_RETENTION_DAYS=90

# Industry-Specific Compliance
HEALTHCARE_HIPAA_COMPLIANCE=true
FINANCIAL_SOX_COMPLIANCE=true
GDPR_COMPLIANCE=true
ISO27001_COMPLIANCE=true

# Monitoring & Reporting
ENABLE_MONITORING=true
ENABLE_REAL_TIME_MONITORING=false
REPORTING_FREQUENCY=daily
REPORTING_FORMAT=json

# Error Handling
ERROR_NOTIFICATION_ENABLED=true
ERROR_NOTIFICATION_EMAIL=admin@tetrix.com
ERROR_ESCALATION_ENABLED=true

# Security
ENCRYPTION_ENABLED=true
ACCESS_CONTROL_ENABLED=true
SESSION_TIMEOUT=3600
EOF
    echo "✅ Created .env file"
else
    echo "ℹ️  .env file already exists, skipping creation"
fi

echo ""
echo "📦 Installing dependencies..."
if command -v pnpm &> /dev/null; then
    pnpm install
elif command -v npm &> /dev/null; then
    npm install
else
    echo "❌ Error: Neither pnpm nor npm found"
    exit 1
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit the .env file and add your Zoho RPA credentials:"
echo "   - ZOHO_RPA_CLIENT_ID"
echo "   - ZOHO_RPA_CLIENT_SECRET"
echo "   - ZOHO_RPA_ACCESS_TOKEN"
echo "   - ZOHO_RPA_REFRESH_TOKEN"
echo "   - ZOHO_RPA_WORKSPACE_ID"
echo ""
echo "2. Read the setup guide for detailed instructions:"
echo "   cat ZOHO_RPA_SETUP.md"
echo ""
echo "3. Test the integration:"
echo "   npm run test:zoho-rpa"
echo ""

