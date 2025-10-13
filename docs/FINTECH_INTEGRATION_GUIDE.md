# 🏦 TETRIX Enterprise 2FA Integration Guide
**For Fintech Companies**

**Version:** 2.0  
**Date:** January 10, 2025  
**Status:** Production Ready  
**Compliance:** SOC II Type II, HIPAA, PKCE OAuth 2.0

---

## 📋 **Executive Summary**

TETRIX provides enterprise-grade 2FA (Two-Factor Authentication) services specifically designed for fintech companies requiring the highest levels of security and compliance. Our platform offers:

- **99.9% Uptime SLA** with enterprise-grade reliability
- **Multi-Channel Verification** (SMS, Voice, WhatsApp, Flash Call)
- **Fraud Detection & Risk Assessment** with real-time threat analysis
- **Comprehensive Audit Logging** for regulatory compliance
- **Rate Limiting & Progressive Security** measures
- **Real-time Webhooks** for instant status updates

---

## 🔗 **API Endpoints & Routes**

### **Base URL**
```
Production: https://tetrixcorp.com/api/v2/2fa
Staging: https://staging.tetrixcorp.com/api/v2/2fa
```

### **Authentication**
All API requests require authentication via API key:
```http
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

---

## 📡 **Core 2FA Endpoints**

### **1. Initiate Verification**
**Endpoint:** `POST /api/v2/2fa/initiate`

**Description:** Initiates a 2FA verification process for a phone number.

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",
  "method": "sms",
  "customCode": "123456",
  "timeoutSecs": 300,
  "userAgent": "YourApp/1.0",
  "ipAddress": "192.168.1.1",
  "sessionId": "session_abc123",
  "metadata": {
    "userId": "user_123",
    "transactionId": "txn_456",
    "riskLevel": "medium"
  }
}
```

**Parameters:**
- `phoneNumber` (required): E.164 formatted phone number
- `method` (optional): `sms`, `voice`, `whatsapp`, `flashcall` (default: `sms`)
- `customCode` (optional): Custom verification code
- `timeoutSecs` (optional): Verification timeout in seconds (default: 300)
- `userAgent` (optional): Client user agent string
- `ipAddress` (optional): Client IP address
- `sessionId` (optional): Unique session identifier
- `metadata` (optional): Additional context data

**Response:**
```json
{
  "success": true,
  "verificationId": "ver_abc123def456",
  "method": "sms",
  "phoneNumber": "+1234567890",
  "expiresAt": "2025-01-10T16:35:00.000Z",
  "estimatedDelivery": 30,
  "fraudScore": 0.2,
  "riskLevel": "low",
  "timestamp": "2025-01-10T16:30:00.000Z"
}
```

---

### **2. Verify Code**
**Endpoint:** `POST /api/v2/2fa/verify`

**Description:** Verifies the 6-digit code provided by the user.

**Request Body:**
```json
{
  "verificationId": "ver_abc123def456",
  "code": "123456",
  "phoneNumber": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "verificationId": "ver_abc123def456",
  "phoneNumber": "+1234567890",
  "method": "sms",
  "verifiedAt": "2025-01-10T16:32:15.000Z",
  "token": "auth_token_xyz789",
  "expiresAt": "2025-01-10T18:32:15.000Z",
  "timestamp": "2025-01-10T16:32:15.000Z"
}
```

---

### **3. Check Verification Status**
**Endpoint:** `GET /api/v2/2fa/status`

**Description:** Retrieves the current status of a verification attempt.

**Query Parameters:**
- `verificationId` (required): The verification ID to check
- `phoneNumber` (optional): Phone number for additional validation

**Response:**
```json
{
  "success": true,
  "data": {
    "verificationId": "ver_abc123def456",
    "status": "verified",
    "phoneNumber": "+1234567890",
    "method": "sms",
    "attempts": 1,
    "createdAt": "2025-01-10T16:30:00.000Z",
    "verifiedAt": "2025-01-10T16:32:15.000Z",
    "expiresAt": "2025-01-10T16:35:00.000Z"
  },
  "timestamp": "2025-01-10T16:32:15.000Z"
}
```

---

### **4. Security Audit Logs**
**Endpoint:** `GET /api/v2/2fa/audit`

**Description:** Retrieves security audit logs for monitoring and compliance.

**Query Parameters:**
- `phoneNumber` (required): Phone number to audit
- `limit` (optional): Number of records to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Headers:**
```http
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```json
{
  "success": true,
  "data": {
    "phoneNumber": "+1234567890",
    "auditLogs": [
      {
        "id": "audit_123",
        "action": "initiate",
        "status": "success",
        "method": "sms",
        "ipAddress": "192.168.1.1",
        "userAgent": "YourApp/1.0",
        "fraudScore": 0.2,
        "riskLevel": "low",
        "timestamp": "2025-01-10T16:30:00.000Z",
        "metadata": {
          "userId": "user_123",
          "transactionId": "txn_456"
        }
      }
    ],
    "pagination": {
      "total": 25,
      "limit": 50,
      "offset": 0,
      "hasMore": false
    },
    "riskAssessment": {
      "score": 0.3,
      "level": "low",
      "recommendations": [
        "Continue normal monitoring",
        "No immediate action required"
      ]
    }
  },
  "timestamp": "2025-01-10T16:32:15.000Z"
}
```

---

## 🔔 **Webhook Endpoints**

### **Telnyx Verify Webhook**
**Endpoint:** `POST /api/webhooks/telnyx/verify`

**Description:** Receives real-time events from Telnyx Verify API.

**Supported Events:**
- `verification.attempted` - Verification code sent
- `verification.verified` - Code successfully verified
- `verification.failed` - Verification failed
- `verification.expired` - Verification expired
- `verification.rate_limited` - Rate limit exceeded

**Webhook Payload:**
```json
{
  "event_type": "verification.verified",
  "data": {
    "id": "ver_abc123def456",
    "phone_number": "+1234567890",
    "type": "sms",
    "status": "verified",
    "verified_at": "2025-01-10T16:32:15.000Z"
  },
  "occurred_at": "2025-01-10T16:32:15.000Z"
}
```

---

## 🛡️ **Security Features**

### **Fraud Detection**
- Real-time risk scoring (0-1 scale)
- IP address analysis
- Device fingerprinting
- Behavioral pattern detection
- Geographic anomaly detection

### **Rate Limiting**
- 5 attempts per 5 minutes per phone number
- Progressive delays for repeated failures
- Automatic blocking for suspicious activity
- Configurable limits per client

### **Audit Logging**
- Complete request/response logging
- Security event tracking
- Compliance reporting
- Real-time monitoring alerts

### **Compliance**
- **SOC II Type II** certified
- **HIPAA** compliant for healthcare data
- **PKCE OAuth 2.0** for secure authentication
- **PCI DSS** ready for payment processing

---

## 💰 **Pricing & Billing**

### **Verification Pricing**
- **SMS Verification:** $0.03 per successful verification
- **Voice Verification:** $0.05 per successful verification
- **WhatsApp Verification:** $0.04 per successful verification
- **Flash Call Verification:** $0.02 per successful verification

### **Enterprise Features**
- **Fraud Detection:** Included
- **Audit Logging:** Included
- **Rate Limiting:** Included
- **Webhooks:** Included
- **99.9% SLA:** Included

### **Volume Discounts**
- 10,000+ verifications/month: 10% discount
- 50,000+ verifications/month: 20% discount
- 100,000+ verifications/month: 30% discount

---

## 🚀 **Integration Examples**

### **JavaScript/Node.js**
```javascript
const axios = require('axios');

class TETRIX2FA {
  constructor(apiKey, baseUrl = 'https://tetrixcorp.com/api/v2/2fa') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async initiateVerification(phoneNumber, method = 'sms') {
    try {
      const response = await axios.post(`${this.baseUrl}/initiate`, {
        phoneNumber,
        method,
        userAgent: 'YourApp/1.0',
        ipAddress: '192.168.1.1',
        sessionId: this.generateSessionId()
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      throw new Error(`2FA initiation failed: ${error.response?.data?.error || error.message}`);
    }
  }

  async verifyCode(verificationId, code, phoneNumber) {
    try {
      const response = await axios.post(`${this.baseUrl}/verify`, {
        verificationId,
        code,
        phoneNumber
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      throw new Error(`2FA verification failed: ${error.response?.data?.error || error.message}`);
    }
  }

  generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }
}

// Usage
const tetrix2FA = new TETRIX2FA('your_api_key_here');

// Initiate verification
const verification = await tetrix2FA.initiateVerification('+1234567890', 'sms');
console.log('Verification ID:', verification.verificationId);

// Verify code
const result = await tetrix2FA.verifyCode(verification.verificationId, '123456', '+1234567890');
console.log('Verification successful:', result.verified);
```

### **Python**
```python
import requests
import json
import time

class TETRIX2FA:
    def __init__(self, api_key, base_url='https://tetrixcorp.com/api/v2/2fa'):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }

    def initiate_verification(self, phone_number, method='sms'):
        payload = {
            'phoneNumber': phone_number,
            'method': method,
            'userAgent': 'YourApp/1.0',
            'ipAddress': '192.168.1.1',
            'sessionId': self.generate_session_id()
        }
        
        response = requests.post(
            f'{self.base_url}/initiate',
            headers=self.headers,
            json=payload
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f'2FA initiation failed: {response.json().get("error", "Unknown error")}')

    def verify_code(self, verification_id, code, phone_number):
        payload = {
            'verificationId': verification_id,
            'code': code,
            'phoneNumber': phone_number
        }
        
        response = requests.post(
            f'{self.base_url}/verify',
            headers=self.headers,
            json=payload
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f'2FA verification failed: {response.json().get("error", "Unknown error")}')

    def generate_session_id(self):
        return f'session_{int(time.time())}_{hash(time.time()) % 10000}'

# Usage
tetrix_2fa = TETRIX2FA('your_api_key_here')

# Initiate verification
verification = tetrix_2fa.initiate_verification('+1234567890', 'sms')
print(f'Verification ID: {verification["verificationId"]}')

# Verify code
result = tetrix_2fa.verify_code(verification['verificationId'], '123456', '+1234567890')
print(f'Verification successful: {result["verified"]}')
```

---

## 📊 **Error Handling**

### **Common Error Codes**
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (invalid API key)
- `403` - Forbidden (rate limited)
- `404` - Not Found (verification not found)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

### **Error Response Format**
```json
{
  "success": false,
  "error": "Error message",
  "status": 400,
  "details": {
    "message": "Detailed error message",
    "type": "validation_error",
    "field": "phoneNumber"
  },
  "timestamp": "2025-01-10T16:30:00.000Z"
}
```

---

## 🔧 **Testing & Sandbox**

### **Sandbox Environment**
- **Base URL:** `https://sandbox.tetrixcorp.com/api/v2/2fa`
- **Test Phone Numbers:** Use any valid E.164 format
- **Test Codes:** Use `123456` for all test verifications
- **Rate Limits:** Relaxed for testing

### **Test Scenarios**
1. **Successful Verification Flow**
2. **Invalid Code Handling**
3. **Rate Limiting Behavior**
4. **Webhook Event Processing**
5. **Fraud Detection Triggers**

---

## 📞 **Support & Contact**

### **Technical Support**
- **Email:** support@tetrixcorp.com
- **Phone:** +1 (555) 123-4567
- **Hours:** 24/7 Enterprise Support

### **Integration Support**
- **Email:** integrations@tetrixcorp.com
- **Slack:** #tetrix-integrations
- **Documentation:** https://docs.tetrixcorp.com

### **Emergency Support**
- **Phone:** +1 (555) 911-TETRIX
- **Email:** emergency@tetrixcorp.com
- **Response Time:** < 15 minutes

---

## 📋 **Next Steps**

1. **Request API Credentials** - Contact our integration team
2. **Set Up Webhook Endpoints** - Configure your webhook handlers
3. **Implement Integration** - Use provided SDKs and examples
4. **Test in Sandbox** - Validate your integration
5. **Go Live** - Deploy to production with confidence

---

*This document is confidential and proprietary to TETRIX Corporation. Unauthorized distribution is prohibited.*
