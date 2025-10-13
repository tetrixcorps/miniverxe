-- SHANGO AI Super Agent Chat Tables Migration
-- This migration adds the necessary tables for SHANGO chat functionality

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
