-- Compliance Engine Database Schema
-- Multi-tenant schema for compliance policies, audit trails, and consent management

-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
    tenant_id VARCHAR(255) PRIMARY KEY,
    tenant_name VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    industry VARCHAR(100),
    region VARCHAR(100) DEFAULT 'USA',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Compliance policies table
CREATE TABLE IF NOT EXISTS compliance_policies (
    policy_id VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    region VARCHAR(100) NOT NULL,
    policy_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    requires_consent_recording BOOLEAN DEFAULT FALSE,
    requires_identity_verification BOOLEAN DEFAULT FALSE,
    requires_disclosure BOOLEAN DEFAULT FALSE,
    disclosure_script_id VARCHAR(255),
    escalation_rules JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tenant_industry (tenant_id, industry),
    INDEX idx_tenant_region (tenant_id, region)
);

-- Disclosure scripts table
CREATE TABLE IF NOT EXISTS disclosure_scripts (
    script_id VARCHAR(255) PRIMARY KEY,
    policy_id VARCHAR(255) NOT NULL REFERENCES compliance_policies(policy_id) ON DELETE CASCADE,
    tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    language VARCHAR(10) NOT NULL DEFAULT 'en-US',
    script_text TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_policy_language (policy_id, language),
    INDEX idx_tenant (tenant_id)
);

-- Audit trail table (immutable, append-only)
CREATE TABLE IF NOT EXISTS audit_trail (
    log_id VARCHAR(255) PRIMARY KEY,
    call_id VARCHAR(255) NOT NULL,
    tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    event_data JSONB NOT NULL,
    event_hash VARCHAR(64) NOT NULL,
    previous_hash VARCHAR(64),
    signature TEXT,
    metadata JSONB,
    INDEX idx_call_id (call_id),
    INDEX idx_tenant_timestamp (tenant_id, timestamp),
    INDEX idx_event_type (event_type),
    INDEX idx_timestamp (timestamp)
);

-- Consent records table
CREATE TABLE IF NOT EXISTS consent_records (
    consent_id VARCHAR(255) PRIMARY KEY,
    customer_id VARCHAR(255) NOT NULL,
    tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    channel VARCHAR(50) NOT NULL,
    consent_type VARCHAR(100) NOT NULL,
    granted BOOLEAN NOT NULL,
    granted_at TIMESTAMP,
    revoked_at TIMESTAMP,
    expires_at TIMESTAMP,
    metadata JSONB,
    audit_trail_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_customer_tenant (customer_id, tenant_id),
    INDEX idx_consent_type (consent_type),
    INDEX idx_granted (granted),
    INDEX idx_expires_at (expires_at)
);

-- Call sessions table (extends IVR sessions with compliance data)
CREATE TABLE IF NOT EXISTS compliant_call_sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    call_control_id VARCHAR(255) NOT NULL,
    tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    from_number VARCHAR(50) NOT NULL,
    to_number VARCHAR(50) NOT NULL,
    industry VARCHAR(100),
    region VARCHAR(100),
    language VARCHAR(10) DEFAULT 'en-US',
    customer_id VARCHAR(255),
    authenticated BOOLEAN DEFAULT FALSE,
    consent_granted BOOLEAN DEFAULT FALSE,
    current_step VARCHAR(100),
    flow_id VARCHAR(255),
    collected_data JSONB,
    audit_trail_id VARCHAR(255),
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    status VARCHAR(50) DEFAULT 'initiated',
    metadata JSONB,
    INDEX idx_tenant_status (tenant_id, status),
    INDEX idx_customer (customer_id),
    INDEX idx_start_time (start_time)
);

-- Integration configurations table
CREATE TABLE IF NOT EXISTS integration_configs (
    config_id VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    integration_type VARCHAR(100) NOT NULL, -- 'crm', 'grc', 'ticketing'
    provider VARCHAR(100) NOT NULL, -- 'salesforce', 'hubspot', 'smarsh', 'zendesk'
    api_key VARCHAR(500),
    api_secret VARCHAR(500),
    base_url VARCHAR(500),
    config_data JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tenant_type (tenant_id, integration_type)
);

-- Redaction logs table (track what was redacted)
CREATE TABLE IF NOT EXISTS redaction_logs (
    redaction_id VARCHAR(255) PRIMARY KEY,
    call_id VARCHAR(255) NOT NULL,
    tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL, -- 'text', 'audio', 'transcript'
    original_length INTEGER NOT NULL,
    redacted_length INTEGER NOT NULL,
    data_types TEXT[], -- Array of data types redacted
    redacted_items JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_call_id (call_id),
    INDEX idx_tenant (tenant_id)
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_policies_updated_at BEFORE UPDATE ON compliance_policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disclosure_scripts_updated_at BEFORE UPDATE ON disclosure_scripts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consent_records_updated_at BEFORE UPDATE ON consent_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_configs_updated_at BEFORE UPDATE ON integration_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_trail_call_tenant ON audit_trail(call_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_consent_customer_tenant_type ON consent_records(customer_id, tenant_id, consent_type);
CREATE INDEX IF NOT EXISTS idx_compliant_sessions_tenant_time ON compliant_call_sessions(tenant_id, start_time);
