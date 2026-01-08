-- OAuth Token Management Database Schema
-- Stores encrypted OAuth tokens and integration configurations

-- OAuth Integrations table
CREATE TABLE IF NOT EXISTS oauth_integrations (
    integration_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    tenant_id VARCHAR(255),
    provider VARCHAR(100) NOT NULL,
    integration_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_provider (provider)
);

-- OAuth Tokens table (encrypted storage)
CREATE TABLE IF NOT EXISTS oauth_tokens (
    token_id VARCHAR(255) PRIMARY KEY,
    integration_id VARCHAR(255) NOT NULL REFERENCES oauth_integrations(integration_id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    -- Encrypted tokens (AES-256-GCM)
    encrypted_access_token TEXT NOT NULL,
    encrypted_refresh_token TEXT,
    -- Token metadata
    expires_at TIMESTAMP NOT NULL,
    token_type VARCHAR(50) DEFAULT 'Bearer',
    scope TEXT,
    token_url TEXT,
    -- Timestamps
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_refreshed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_integration_id (integration_id),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);

-- OAuth Configurations table
CREATE TABLE IF NOT EXISTS oauth_configurations (
    config_id VARCHAR(255) PRIMARY KEY,
    provider VARCHAR(100) NOT NULL UNIQUE,
    client_id VARCHAR(255) NOT NULL,
    encrypted_client_secret TEXT NOT NULL,
    authorization_url TEXT NOT NULL,
    token_url TEXT NOT NULL,
    default_scopes TEXT,
    grant_types TEXT, -- JSON array: ['authorization_code', 'client_credentials']
    pkce_enabled BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_provider (provider)
);

-- OAuth State table (temporary storage for OAuth flows)
CREATE TABLE IF NOT EXISTS oauth_states (
    state_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    integration_id VARCHAR(255) NOT NULL,
    state_value VARCHAR(255) NOT NULL,
    code_verifier TEXT, -- For PKCE
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_integration (user_id, integration_id),
    INDEX idx_expires_at (expires_at)
);

-- Cleanup expired states (run periodically)
-- DELETE FROM oauth_states WHERE expires_at < NOW();
