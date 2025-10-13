#!/bin/bash

# SHANGO AI Super Agent Integration Setup Script
# This script sets up the complete SHANGO integration for TETRIX & JoRoMi platforms

set -e

echo "⚡ Setting up SHANGO AI Super Agent Integration"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_shango() {
    echo -e "${PURPLE}[SHANGO]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the TETRIX project root directory"
    exit 1
fi

print_shango "Initializing SHANGO AI Super Agent Integration..."

# Step 1: Install required dependencies
print_status "Installing required dependencies..."

# Frontend dependencies
if [ -f "package.json" ]; then
    print_status "Installing frontend dependencies..."
    npm install @sinch/sinch-chat-live
    print_success "Frontend dependencies installed"
fi

# JoRoMi frontend dependencies
if [ -d "../joromi/frontend" ]; then
    print_status "Installing JoRoMi frontend dependencies..."
    cd ../joromi/frontend
    npm install @sinch/sinch-chat-live
    cd ../../tetrix
    print_success "JoRoMi frontend dependencies installed"
fi

# Step 2: Create environment configuration
print_status "Creating environment configuration..."

cat > .env.shango << EOF
# SHANGO AI Super Agent Configuration
SINCH_API_KEY=your_sinch_api_key_here
SINCH_WIDGET_ID=your_widget_id_here
SINCH_BASE_URL=https://api.sinch.com
SINCH_WEBHOOK_SECRET=your_webhook_secret_here

# Next.js Environment Variables
NEXT_PUBLIC_SINCH_API_KEY=your_sinch_api_key_here
NEXT_PUBLIC_SINCH_WIDGET_ID=your_widget_id_here
NEXT_PUBLIC_SINCH_BASE_URL=https://api.sinch.com

# SHANGO Chat Configuration
SHANGO_SESSION_TIMEOUT=3600
SHANGO_MAX_MESSAGES=1000
SHANGO_AGENT_RESPONSE_TIMEOUT=300
SHANGO_DEFAULT_AGENT=shango-general

# Database Configuration for Chat
DATABASE_URL=postgresql://user:password@localhost:5432/tetrix_chat
REDIS_URL=redis://localhost:6379

# AI Orchestrator Configuration
AIQ_ORCHESTRATOR_URL=http://aiq_orchestrator:8082/aiq/run
AIQ_ORCHESTRATOR_STREAM_URL=http://aiq_orchestrator:8082/aiq/run/stream
EOF

print_success "Environment configuration created"

# Step 3: Create database migration for chat tables
print_status "Creating database migration for SHANGO chat tables..."

cat > services/api/prisma/migrations/$(date +%Y%m%d%H%M%S)_add_shango_chat_tables.sql << 'EOF'
-- SHANGO AI Super Agent Chat Tables Migration

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL,
    agent_id VARCHAR,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'waiting', 'ended')),
    channel VARCHAR(20) DEFAULT 'chat' CHECK (channel IN ('chat', 'voice', 'sms', 'email')),
    shango_agent_id VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'shango', 'agent', 'system')),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'file', 'image', 'video')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Create shango_agents table
CREATE TABLE IF NOT EXISTS shango_agents (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    capabilities JSONB,
    tools JSONB,
    personality VARCHAR,
    avatar VARCHAR,
    greeting TEXT,
    is_active VARCHAR DEFAULT 'true',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_analytics table
CREATE TABLE IF NOT EXISTS chat_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id),
    user_id VARCHAR NOT NULL,
    shango_agent_id VARCHAR,
    message_count INTEGER DEFAULT 0,
    session_duration INTEGER DEFAULT 0,
    satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
    resolution_status VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_shango_agent_id ON chat_sessions(shango_agent_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_chat_analytics_user_id ON chat_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_analytics_shango_agent_id ON chat_analytics(shango_agent_id);

-- Insert default SHANGO agents
INSERT INTO shango_agents (id, name, description, capabilities, tools, personality, avatar, greeting) VALUES
('shango-general', 'SHANGO', 'Your AI Super Agent for general assistance and support', 
 '["general_questions", "basic_support", "product_info", "troubleshooting"]',
 '["n8n", "knowledge_base", "api_docs"]',
 'friendly', '⚡', 'Hello! I''m SHANGO, your AI Super Agent. How can I help you today?'),

('shango-technical', 'SHANGO Tech', 'Specialized in technical issues and advanced troubleshooting',
 '["technical_support", "api_integration", "debugging", "system_analysis"]',
 '["n8n", "api_docs", "system_logs", "debugging_tools"]',
 'technical', '🔧', 'Hi! I''m SHANGO Tech, your technical AI Super Agent. What technical challenge can I help you solve?'),

('shango-sales', 'SHANGO Sales', 'Expert in sales, pricing, and product recommendations',
 '["sales", "product_recommendations", "pricing_info", "demo_requests", "lead_qualification"]',
 '["n8n", "crm", "pricing_engine", "product_catalog"]',
 'sales', '💼', 'Welcome! I''m SHANGO Sales, your AI Super Agent for all sales inquiries. How can I help you succeed today?'),

('shango-billing', 'SHANGO Billing', 'Specialized in billing, payments, and account management',
 '["billing_support", "payment_issues", "subscription_management", "account_updates"]',
 '["n8n", "stripe", "billing_system", "account_management"]',
 'professional', '💳', 'Hello! I''m SHANGO Billing, your AI Super Agent for billing and account matters. How can I assist you?')
ON CONFLICT (id) DO NOTHING;
EOF

print_success "Database migration created"

# Step 4: Create SHANGO integration documentation
print_status "Creating SHANGO integration documentation..."

cat > docs/SHANGO_INTEGRATION_GUIDE.md << 'EOF'
# SHANGO AI Super Agent Integration Guide

## Overview

SHANGO is our AI Super Agent that provides intelligent assistance across multiple channels including chat, voice, SMS, and email. This guide covers the complete integration setup and usage.

## Features

### 🤖 AI Super Agents
- **SHANGO General**: General assistance and support
- **SHANGO Tech**: Technical issues and troubleshooting  
- **SHANGO Sales**: Sales and product information
- **SHANGO Billing**: Billing and account support

### 📱 Multi-Channel Support
- **Chat**: Real-time text conversations
- **Voice**: Voice calls with Telnyx integration
- **SMS**: Text messaging support
- **Email**: Email integration

### 🧠 Intelligent Features
- **Intent Recognition**: Automatically routes to appropriate agent
- **Context Awareness**: Maintains conversation context
- **Confidence Scoring**: Provides confidence levels for responses
- **Entity Extraction**: Extracts phone numbers, emails, etc.

## Setup Instructions

### 1. Environment Configuration

Copy the environment variables from `.env.shango` to your `.env` file:

```bash
cp .env.shango .env
```

Update the SinchChatLive credentials with your actual API keys.

### 2. Database Setup

Run the database migration to create the chat tables:

```bash
# For TETRIX platform
cd services/api
npx prisma migrate dev

# For JoRoMi platform  
cd ../../joromi/backend
npx prisma migrate dev
```

### 3. Frontend Integration

The SHANGO chat widget is automatically available on:
- Contact page (`/contact`)
- Dashboard (`/dashboard` or `/enhanced-dashboard`)

### 4. Backend API

The SHANGO API endpoints are available at:
- `GET /api/v1/shango/agents` - List all SHANGO agents
- `POST /api/v1/shango/sessions` - Create chat session
- `POST /api/v1/shango/sessions/{id}/messages` - Send message
- `GET /api/v1/shango/sessions/{id}/messages` - Get chat history

## Usage Examples

### Starting a Chat Session

```typescript
import { getSHANGOAIService } from '../services/sinchChatService';

const shangoService = getSHANGOAIService();
const session = await shangoService.startSHANGOChat('user-123', 'shango-technical');
```

### Sending a Message

```typescript
await shangoService.sendSHANGOMessage(session.id, 'Help me with API integration');
```

### Switching Agents

```typescript
// Transfer to different SHANGO agent
await shangoService.transferToAgent(session.id, 'shango-sales');
```

## Customization

### Adding New SHANGO Agents

1. Add agent definition to `SHANGO_AGENTS` in the backend
2. Update the frontend agent selector
3. Add agent-specific capabilities and tools

### Customizing Responses

Modify the `generate_shango_response()` function in the backend to customize how SHANGO responds to different intents and contexts.

## Monitoring and Analytics

The system tracks:
- Session duration and message count
- Agent performance and satisfaction scores
- Intent recognition accuracy
- User engagement metrics

Access analytics through the dashboard or API endpoints.

## Support

For technical support with SHANGO integration:
- Check the logs for error messages
- Verify SinchChatLive API credentials
- Ensure database migrations are applied
- Test with different SHANGO agents

EOF

print_success "Documentation created"

# Step 5: Create test script
print_status "Creating SHANGO test script..."

cat > scripts/test-shango-integration.js << 'EOF'
#!/usr/bin/env node

/**
 * SHANGO AI Super Agent Integration Test Script
 * Tests the complete SHANGO integration functionality
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000/api/v1';
const TEST_USER_ID = 'test-user-' + Date.now();

async function testSHANGOIntegration() {
    console.log('⚡ Testing SHANGO AI Super Agent Integration');
    console.log('==========================================');

    try {
        // Test 1: Get SHANGO agents
        console.log('\n1. Testing SHANGO agents endpoint...');
        const agentsResponse = await axios.get(`${API_BASE_URL}/shango/agents`);
        console.log('✅ SHANGO agents retrieved:', agentsResponse.data.length, 'agents');

        // Test 2: Create chat session
        console.log('\n2. Testing chat session creation...');
        const sessionResponse = await axios.post(`${API_BASE_URL}/shango/sessions`, {
            user_id: TEST_USER_ID,
            shango_agent_id: 'shango-general',
            channel: 'chat'
        });
        console.log('✅ Chat session created:', sessionResponse.data.id);

        const sessionId = sessionResponse.data.id;

        // Test 3: Send message
        console.log('\n3. Testing message sending...');
        const messageResponse = await axios.post(`${API_BASE_URL}/shango/sessions/${sessionId}/messages`, {
            content: 'Hello SHANGO! Can you help me with VoIP setup?',
            message_type: 'text'
        });
        console.log('✅ Message sent and SHANGO responded:', messageResponse.data.content.substring(0, 50) + '...');

        // Test 4: Get chat history
        console.log('\n4. Testing chat history...');
        const historyResponse = await axios.get(`${API_BASE_URL}/shango/sessions/${sessionId}/messages`);
        console.log('✅ Chat history retrieved:', historyResponse.data.length, 'messages');

        // Test 5: Transfer to different agent
        console.log('\n5. Testing agent transfer...');
        const transferResponse = await axios.post(`${API_BASE_URL}/shango/sessions/${sessionId}/transfer`, {
            agent_id: 'shango-technical'
        });
        console.log('✅ Transferred to SHANGO Tech');

        // Test 6: End session
        console.log('\n6. Testing session end...');
        await axios.delete(`${API_BASE_URL}/shango/sessions/${sessionId}`);
        console.log('✅ Session ended successfully');

        console.log('\n🎉 All SHANGO integration tests passed!');
        console.log('SHANGO AI Super Agent is ready for production use.');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

// Run tests
testSHANGOIntegration();
EOF

chmod +x scripts/test-shango-integration.js
print_success "Test script created"

# Step 6: Create deployment script
print_status "Creating deployment script..."

cat > scripts/deploy-shango.sh << 'EOF'
#!/bin/bash

# SHANGO AI Super Agent Deployment Script

echo "⚡ Deploying SHANGO AI Super Agent Integration"
echo "============================================="

# Build frontend
echo "Building TETRIX frontend..."
npm run build

# Build JoRoMi frontend
if [ -d "../joromi/frontend" ]; then
    echo "Building JoRoMi frontend..."
    cd ../joromi/frontend
    npm run build
    cd ../../tetrix
fi

# Run database migrations
echo "Running database migrations..."
if [ -f "services/api/prisma/schema.prisma" ]; then
    cd services/api
    npx prisma migrate deploy
    cd ../..
fi

if [ -d "../joromi/backend" ]; then
    cd ../joromi/backend
    npx prisma migrate deploy
    cd ../../tetrix
fi

# Start services
echo "Starting services..."
if [ -f "docker-compose.yml" ]; then
    docker-compose up -d
fi

echo "✅ SHANGO AI Super Agent deployment completed!"
echo "Visit your application to start chatting with SHANGO."
EOF

chmod +x scripts/deploy-shango.sh
print_success "Deployment script created"

# Step 7: Final setup summary
print_shango "SHANGO AI Super Agent Integration Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Update .env.shango with your SinchChatLive API credentials"
echo "2. Run database migrations: npm run migrate"
echo "3. Test the integration: node scripts/test-shango-integration.js"
echo "4. Deploy: ./scripts/deploy-shango.sh"
echo ""
echo "🎯 SHANGO Features Available:"
echo "• ⚡ SHANGO General - General assistance"
echo "• 🔧 SHANGO Tech - Technical support"
echo "• 💼 SHANGO Sales - Sales assistance"
echo "• 💳 SHANGO Billing - Billing support"
echo ""
echo "📱 Multi-Channel Support:"
echo "• 💬 Live chat on contact page"
echo "• 📞 Voice integration with Telnyx"
echo "• 📱 SMS messaging support"
echo "• 📧 Email integration"
echo ""
print_success "SHANGO AI Super Agent is ready to serve your users!"
