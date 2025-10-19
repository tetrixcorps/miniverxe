#!/bin/bash
# TETRIX Campaign System Quick Start Script

echo "🚀 TETRIX Campaign System Quick Start"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check environment variables
echo "🔧 Checking environment variables..."

if [ -z "$MAILGUN_API_KEY" ]; then
    echo "⚠️  MAILGUN_API_KEY is not set"
fi

if [ -z "$MAILGUN_DOMAIN" ]; then
    echo "⚠️  MAILGUN_DOMAIN is not set"
fi

if [ -z "$TELNYX_API_KEY" ]; then
    echo "⚠️  TELNYX_API_KEY is not set"
fi

if [ -z "$TELNYX_MESSAGING_PROFILE_ID" ]; then
    echo "⚠️  TELNYX_MESSAGING_PROFILE_ID is not set"
fi

if [ -z "$BASE_URL" ]; then
    echo "⚠️  BASE_URL is not set"
fi

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed successfully"

# Check if environment variables are set
if [ -z "$MAILGUN_API_KEY" ] || [ -z "$MAILGUN_DOMAIN" ] || [ -z "$TELNYX_API_KEY" ]; then
    echo ""
    echo "⚠️  WARNING: Some required environment variables are not set."
    echo "   Please set the following environment variables before running campaigns:"
    echo ""
    echo "   export MAILGUN_API_KEY='your_mailgun_api_key'"
    echo "   export MAILGUN_DOMAIN='your_mailgun_domain'"
    echo "   export TELNYX_API_KEY='your_telnyx_api_key'"
    echo "   export TELNYX_MESSAGING_PROFILE_ID='your_messaging_profile_id'"
    echo "   export BASE_URL='https://your-domain.com'"
    echo ""
    echo "   Then run: npm start"
else
    echo "✅ All required environment variables are set"
    echo ""
    echo "🎯 Ready to execute campaigns!"
    echo ""
    echo "Available commands:"
    echo "  npm start                    - Execute all campaigns"
    echo "  npm run campaign:test        - Test campaign execution"
    echo "  npm run campaign:healthcare  - Execute healthcare campaign only"
    echo "  npm run campaign:construction - Execute construction campaign only"
    echo "  npm run campaign:fleet       - Execute fleet campaign only"
    echo ""
    echo "To start executing campaigns, run: npm start"
fi

echo ""
echo "📚 For more information, see README.md"
echo "🔗 TETRIX Campaign System v1.0.0"
