"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerDataIsolationService = void 0;
const uuid_1 = require("uuid");
const crypto_1 = __importDefault(require("crypto"));
class CustomerDataIsolationService {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
        this.encryptionKey = process.env.DATA_ENCRYPTION_KEY || 'default-encryption-key';
    }
    async initializeTenantDataIsolation(tenantId, config = {}) {
        const isolationConfig = {
            tenantId,
            encryptionKey: this.generateEncryptionKey(),
            dataPrefix: `tenant_${tenantId}`,
            isolationLevel: 'row',
            crossTenantQueries: false,
            dataMasking: {
                enabled: true,
                fields: ['phone', 'email', 'ssn', 'credit_card'],
                maskType: 'partial',
                maskCharacter: '*',
                preserveLength: true
            },
            auditTrail: true,
            ...config
        };
        await this.redis.setEx(`data_isolation:${tenantId}`, 86400, JSON.stringify(isolationConfig));
        await this.createTenantDataPolicy(tenantId);
        console.log(`Initialized data isolation for tenant: ${tenantId}`);
        return isolationConfig;
    }
    async createTenantDataPolicy(tenantId) {
        const policy = {
            tenantId,
            dataRetentionDays: 2555,
            encryptionEnabled: true,
            anonymizationEnabled: true,
            crossTenantSharing: false,
            gdprCompliant: true,
            ccpCompliant: true,
            dataClassification: 'confidential',
            accessControls: [
                {
                    id: (0, uuid_1.v4)(),
                    resource: 'customer_data',
                    action: 'read',
                    role: 'tenant_admin',
                    conditions: []
                },
                {
                    id: (0, uuid_1.v4)(),
                    resource: 'customer_data',
                    action: 'write',
                    role: 'tenant_admin',
                    conditions: []
                }
            ],
            auditLogging: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await this.redis.setEx(`data_policy:${tenantId}`, 86400, JSON.stringify(policy));
        return policy;
    }
    async storeCustomerData(tenantId, customerData) {
        const isolationConfig = await this.getDataIsolationConfig(tenantId);
        if (!isolationConfig) {
            throw new Error(`Data isolation not configured for tenant: ${tenantId}`);
        }
        const encryptedId = this.encryptData(customerData.phone, isolationConfig.encryptionKey);
        const customer = {
            id: (0, uuid_1.v4)(),
            tenantId,
            encryptedId,
            ...customerData,
            dataClassification: 'confidential',
            isAnonymized: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const encryptedCustomer = this.encryptCustomerData(customer, isolationConfig);
        const storageKey = `${isolationConfig.dataPrefix}:customer:${customer.id}`;
        await this.redis.setEx(storageKey, 86400, JSON.stringify(encryptedCustomer));
        await this.logDataAccess(tenantId, 'system', 'create', 'customer_data', customer.id);
        return customer;
    }
    async getCustomerData(tenantId, customerId, requestingUserId) {
        const hasAccess = await this.checkDataAccess(tenantId, requestingUserId, 'customer_data', 'read');
        if (!hasAccess) {
            throw new Error('Access denied to customer data');
        }
        const isolationConfig = await this.getDataIsolationConfig(tenantId);
        if (!isolationConfig) {
            throw new Error(`Data isolation not configured for tenant: ${tenantId}`);
        }
        const storageKey = `${isolationConfig.dataPrefix}:customer:${customerId}`;
        const encryptedData = await this.redis.get(storageKey);
        if (!encryptedData) {
            return null;
        }
        const customer = JSON.parse(encryptedData);
        const decryptedCustomer = this.decryptCustomerData(customer, isolationConfig);
        const maskedCustomer = this.applyDataMasking(decryptedCustomer, isolationConfig.dataMasking);
        await this.logDataAccess(tenantId, requestingUserId, 'read', 'customer_data', customerId);
        return maskedCustomer;
    }
    async searchCustomers(tenantId, query, requestingUserId) {
        const hasAccess = await this.checkDataAccess(tenantId, requestingUserId, 'customer_data', 'read');
        if (!hasAccess) {
            throw new Error('Access denied to customer data');
        }
        const isolationConfig = await this.getDataIsolationConfig(tenantId);
        if (!isolationConfig) {
            throw new Error(`Data isolation not configured for tenant: ${tenantId}`);
        }
        const searchPattern = `${isolationConfig.dataPrefix}:customer:*`;
        const keys = await this.redis.keys(searchPattern);
        const customers = [];
        for (const key of keys) {
            const encryptedData = await this.redis.get(key);
            if (encryptedData) {
                const customer = JSON.parse(encryptedData);
                const decryptedCustomer = this.decryptCustomerData(customer, isolationConfig);
                const maskedCustomer = this.applyDataMasking(decryptedCustomer, isolationConfig.dataMasking);
                if (this.matchesSearchQuery(maskedCustomer, query)) {
                    customers.push(maskedCustomer);
                }
            }
        }
        await this.logDataAccess(tenantId, requestingUserId, 'search', 'customer_data');
        return customers;
    }
    async storeCustomerInteraction(tenantId, interaction) {
        const isolationConfig = await this.getDataIsolationConfig(tenantId);
        if (!isolationConfig) {
            throw new Error(`Data isolation not configured for tenant: ${tenantId}`);
        }
        const customerInteraction = {
            id: (0, uuid_1.v4)(),
            tenantId,
            ...interaction,
            dataClassification: 'confidential',
            isAnonymized: false
        };
        const encryptedInteraction = this.encryptInteractionData(customerInteraction, isolationConfig);
        const storageKey = `${isolationConfig.dataPrefix}:interaction:${customerInteraction.id}`;
        await this.redis.setEx(storageKey, 86400, JSON.stringify(encryptedInteraction));
        await this.logDataAccess(tenantId, 'system', 'create', 'customer_interaction', customerInteraction.id);
        return customerInteraction;
    }
    async anonymizeCustomerData(tenantId, customerId) {
        const isolationConfig = await this.getDataIsolationConfig(tenantId);
        if (!isolationConfig) {
            throw new Error(`Data isolation not configured for tenant: ${tenantId}`);
        }
        const customer = await this.getCustomerData(tenantId, customerId, 'system');
        if (!customer) {
            throw new Error('Customer not found');
        }
        const anonymizedCustomer = {
            ...customer,
            name: this.anonymizeString(customer.name || ''),
            email: this.anonymizeEmail(customer.email || ''),
            phone: this.anonymizePhone(customer.phone),
            customFields: this.anonymizeCustomFields(customer.customFields),
            isAnonymized: true,
            updatedAt: new Date()
        };
        const encryptedAnonymized = this.encryptCustomerData(anonymizedCustomer, isolationConfig);
        const storageKey = `${isolationConfig.dataPrefix}:customer:${customerId}`;
        await this.redis.setEx(storageKey, 86400, JSON.stringify(encryptedAnonymized));
        await this.logDataAccess(tenantId, 'system', 'anonymize', 'customer_data', customerId);
    }
    async deleteCustomerData(tenantId, customerId) {
        const isolationConfig = await this.getDataIsolationConfig(tenantId);
        if (!isolationConfig) {
            throw new Error(`Data isolation not configured for tenant: ${tenantId}`);
        }
        const customerKey = `${isolationConfig.dataPrefix}:customer:${customerId}`;
        await this.redis.del(customerKey);
        const interactionPattern = `${isolationConfig.dataPrefix}:interaction:*`;
        const interactionKeys = await this.redis.keys(interactionPattern);
        for (const key of interactionKeys) {
            const interaction = await this.redis.get(key);
            if (interaction) {
                const parsedInteraction = JSON.parse(interaction);
                if (parsedInteraction.customerId === customerId) {
                    await this.redis.del(key);
                }
            }
        }
        await this.logDataAccess(tenantId, 'system', 'delete', 'customer_data', customerId);
    }
    async checkDataAccess(tenantId, userId, resource, action) {
        const policy = await this.getTenantDataPolicy(tenantId);
        if (!policy) {
            return false;
        }
        for (const accessControl of policy.accessControls) {
            if (accessControl.resource === resource && accessControl.action === action) {
                return true;
            }
        }
        return false;
    }
    async getDataIsolationConfig(tenantId) {
        const configData = await this.redis.get(`data_isolation:${tenantId}`);
        return configData ? JSON.parse(configData) : null;
    }
    async getTenantDataPolicy(tenantId) {
        const policyData = await this.redis.get(`data_policy:${tenantId}`);
        return policyData ? JSON.parse(policyData) : null;
    }
    encryptCustomerData(customer, config) {
        const encrypted = { ...customer };
        if (config.dataMasking.enabled) {
            encrypted.phone = this.encryptData(customer.phone, config.encryptionKey);
            if (customer.email) {
                encrypted.email = this.encryptData(customer.email, config.encryptionKey);
            }
            if (customer.name) {
                encrypted.name = this.encryptData(customer.name, config.encryptionKey);
            }
        }
        return encrypted;
    }
    decryptCustomerData(customer, config) {
        const decrypted = { ...customer };
        if (config.dataMasking.enabled) {
            decrypted.phone = this.decryptData(customer.phone, config.encryptionKey);
            if (customer.email) {
                decrypted.email = this.decryptData(customer.email, config.encryptionKey);
            }
            if (customer.name) {
                decrypted.name = this.decryptData(customer.name, config.encryptionKey);
            }
        }
        return decrypted;
    }
    encryptInteractionData(interaction, config) {
        const encrypted = { ...interaction };
        if (config.dataMasking.enabled) {
            encrypted.notes = this.encryptData(interaction.notes, config.encryptionKey);
        }
        return encrypted;
    }
    applyDataMasking(customer, maskingConfig) {
        if (!maskingConfig.enabled) {
            return customer;
        }
        const masked = { ...customer };
        for (const field of maskingConfig.fields) {
            if (field === 'phone' && customer.phone) {
                masked.phone = this.maskString(customer.phone, maskingConfig);
            }
            if (field === 'email' && customer.email) {
                masked.email = this.maskString(customer.email, maskingConfig);
            }
            if (field === 'name' && customer.name) {
                masked.name = this.maskString(customer.name, maskingConfig);
            }
        }
        return masked;
    }
    maskString(value, config) {
        if (config.maskType === 'full') {
            return config.maskCharacter.repeat(value.length);
        }
        if (config.maskType === 'partial') {
            const visibleLength = Math.max(1, Math.floor(value.length * 0.3));
            const maskedLength = value.length - visibleLength;
            const visiblePart = value.substring(0, visibleLength);
            const maskedPart = config.maskCharacter.repeat(maskedLength);
            return visiblePart + maskedPart;
        }
        if (config.maskType === 'hash') {
            return crypto_1.default.createHash('sha256').update(value).digest('hex').substring(0, 8);
        }
        return value;
    }
    anonymizeString(value) {
        if (!value)
            return '';
        return 'Anonymous_' + crypto_1.default.createHash('md5').update(value).digest('hex').substring(0, 8);
    }
    anonymizeEmail(email) {
        if (!email)
            return '';
        const [localPart, domain] = email.split('@');
        return `anonymous_${crypto_1.default.createHash('md5').update(localPart).digest('hex').substring(0, 4)}@${domain}`;
    }
    anonymizePhone(phone) {
        if (!phone)
            return '';
        return '+1***-***-' + phone.slice(-4);
    }
    anonymizeCustomFields(fields) {
        const anonymized = {};
        for (const [key, value] of Object.entries(fields)) {
            if (typeof value === 'string') {
                anonymized[key] = this.anonymizeString(value);
            }
            else {
                anonymized[key] = value;
            }
        }
        return anonymized;
    }
    encryptData(data, key) {
        const cipher = crypto_1.default.createCipher('aes-256-cbc', key);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }
    decryptData(encryptedData, key) {
        const decipher = crypto_1.default.createDecipher('aes-256-cbc', key);
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    generateEncryptionKey() {
        return crypto_1.default.randomBytes(32).toString('hex');
    }
    matchesSearchQuery(customer, query) {
        if (!query)
            return true;
        if (query.phone && !customer.phone.includes(query.phone)) {
            return false;
        }
        if (query.email && customer.email && !customer.email.includes(query.email)) {
            return false;
        }
        if (query.tier && customer.tier !== query.tier) {
            return false;
        }
        return true;
    }
    async logDataAccess(tenantId, userId, action, resource, resourceId) {
        const log = {
            id: (0, uuid_1.v4)(),
            tenantId,
            userId,
            resource,
            action,
            customerId: resourceId,
            ipAddress: '127.0.0.1',
            userAgent: 'TETRIX-System',
            timestamp: new Date(),
            success: true,
            dataAccessed: [resource]
        };
        await this.redis.lPush(`data_access_log:${tenantId}`, JSON.stringify(log));
        await this.redis.expire(`data_access_log:${tenantId}`, 86400 * 30);
    }
}
exports.CustomerDataIsolationService = CustomerDataIsolationService;
//# sourceMappingURL=CustomerDataIsolationService.js.map