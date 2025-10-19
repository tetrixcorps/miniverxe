# 🔌 TETRIX 2FA API Reference

**Version:** 2.0  
**Base URL:** `https://tetrixcorp.com/api/v2/2fa`  
**Authentication:** Bearer Token (Optional for testing)  
**Content-Type:** `application/json`

---

## 🔐 **Authentication**

All API requests require authentication using a Bearer token in the Authorization header:

```http
Authorization: Bearer YOUR_API_KEY
```

### **API Key Management**
- **Sandbox Key:** For testing and development
- **Production Key:** For live applications
- **Key Rotation:** Supported with 30-day notice
- **Rate Limits:** Per-key basis

---

## 📡 **Endpoints Overview**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/initiate` | Initiate 2FA verification |
| `POST` | `/verify` | Verify 6-digit code |
| `GET` | `/status` | Check verification status |
| `GET` | `/audit` | Retrieve audit logs |

---

## 🚀 **POST /initiate**

Initiates a 2FA verification process.

### **Request**

```http
POST /api/v2/2fa/initiate
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

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

### **Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phoneNumber` | string | ✅ | E.164 formatted phone number |
| `method` | string | ❌ | Verification method (`sms`, `voice`, `whatsapp`, `flashcall`) |
| `customCode` | string | ❌ | Custom verification code |
| `timeoutSecs` | integer | ❌ | Verification timeout in seconds (default: 300) |
| `userAgent` | string | ❌ | Client user agent string |
| `ipAddress` | string | ❌ | Client IP address |
| `sessionId` | string | ❌ | Unique session identifier |
| `metadata` | object | ❌ | Additional context data |

### **Response**

#### **Success (200)**
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

#### **Error (400)**
```json
{
  "success": false,
  "error": "Invalid phone number format",
  "status": 400,
  "details": {
    "message": "Phone number must be in E.164 format",
    "type": "validation_error",
    "field": "phoneNumber"
  },
  "timestamp": "2025-01-10T16:30:00.000Z"
}
```

---

## ✅ **POST /verify**

Verifies the 6-digit code provided by the user.

### **Request**

```http
POST /api/v2/2fa/verify
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "verificationId": "ver_abc123def456",
  "code": "123456",
  "phoneNumber": "+1234567890"
}
```

### **Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `verificationId` | string | ✅ | Verification ID from initiate response |
| `code` | string | ✅ | 6-digit verification code |
| `phoneNumber` | string | ✅ | Phone number used for verification |

### **Response**

#### **Success (200)**
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

#### **Error (400)**
```json
{
  "success": false,
  "error": "Invalid verification code",
  "status": 400,
  "details": {
    "message": "The verification code is incorrect",
    "type": "verification_failed",
    "field": "code"
  },
  "timestamp": "2025-01-10T16:32:15.000Z"
}
```

---

## 📊 **GET /status**

Retrieves the current status of a verification attempt.

### **Request**

```http
GET /api/v2/2fa/status?verificationId=ver_abc123def456&phoneNumber=+1234567890
Authorization: Bearer YOUR_API_KEY
```

### **Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `verificationId` | string | ✅ | Verification ID to check |
| `phoneNumber` | string | ❌ | Phone number for additional validation |

### **Response**

#### **Success (200)**
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

#### **Error (404)**
```json
{
  "success": false,
  "error": "Verification not found",
  "status": 404,
  "details": {
    "message": "No verification found with the provided ID",
    "type": "not_found"
  },
  "timestamp": "2025-01-10T16:32:15.000Z"
}
```

---

## 🔍 **GET /audit**

Retrieves security audit logs for monitoring and compliance.

### **Request**

```http
GET /api/v2/2fa/audit?phoneNumber=+1234567890&limit=50&offset=0
Authorization: Bearer YOUR_API_KEY
```

### **Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phoneNumber` | string | ✅ | Phone number to audit |
| `limit` | integer | ❌ | Number of records to return (default: 50) |
| `offset` | integer | ❌ | Pagination offset (default: 0) |

### **Response**

#### **Success (200)**
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

## 🔔 **Webhook: POST /webhooks/telnyx/verify**

Receives real-time events from Telnyx Verify API.

### **Webhook Events**

| Event Type | Description |
|------------|-------------|
| `verification.attempted` | Verification code sent |
| `verification.verified` | Code successfully verified |
| `verification.failed` | Verification failed |
| `verification.expired` | Verification expired |
| `verification.rate_limited` | Rate limit exceeded |

### **Webhook Payload**

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

### **Webhook Security**

- **Signature Verification:** Validate `telnyx-signature` header
- **HTTPS Required:** All webhook endpoints must use HTTPS
- **Retry Logic:** Implement exponential backoff for failed deliveries
- **Idempotency:** Handle duplicate events gracefully

---

## ⚠️ **Error Codes**

| Code | Description | Action |
|------|-------------|--------|
| `400` | Bad Request | Check request parameters |
| `401` | Unauthorized | Verify API key |
| `403` | Forbidden | Check rate limits or permissions |
| `404` | Not Found | Verify resource exists |
| `429` | Too Many Requests | Implement rate limiting |
| `500` | Internal Server Error | Contact support |

### **Error Response Format**

```json
{
  "success": false,
  "error": "Error message",
  "status": 400,
  "details": {
    "message": "Detailed error message",
    "type": "error_type",
    "field": "field_name"
  },
  "timestamp": "2025-01-10T16:30:00.000Z"
}
```

---

## 🚦 **Rate Limiting**

### **Limits**
- **Per API Key:** 1000 requests/minute
- **Per Phone Number:** 5 attempts per 5 minutes
- **Per IP Address:** 100 requests/minute

### **Headers**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1641234567
```

### **Rate Limit Exceeded**
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "status": 429,
  "details": {
    "message": "Too many requests. Please try again later.",
    "type": "rate_limit_exceeded",
    "retry_after": 60
  },
  "timestamp": "2025-01-10T16:30:00.000Z"
}
```

---

## 🔒 **Security Features**

### **Fraud Detection**
- **Risk Scoring:** 0-1 scale based on multiple factors
- **IP Analysis:** Geographic and reputation checking
- **Device Fingerprinting:** Browser and device analysis
- **Behavioral Patterns:** Usage pattern analysis

### **Rate Limiting**
- **Progressive Delays:** Increasing delays for repeated failures
- **Automatic Blocking:** Temporary blocks for suspicious activity
- **Configurable Limits:** Custom limits per client

### **Audit Logging**
- **Complete Logging:** All requests and responses logged
- **Security Events:** Fraud attempts and suspicious activity
- **Compliance Reporting:** Automated compliance reports
- **Real-time Monitoring:** Live security monitoring

---

## 📱 **Supported Verification Methods**

| Method | Description | Cost | Delivery Time |
|--------|-------------|------|---------------|
| `sms` | SMS text message | $0.03 | 5-30 seconds |
| `voice` | Voice call | $0.05 | 10-60 seconds |
| `whatsapp` | WhatsApp message | $0.04 | 5-30 seconds |
| `flashcall` | Flash call | $0.02 | 5-15 seconds |

---

## 🌍 **Geographic Coverage**

### **Supported Countries**
- **North America:** US, Canada, Mexico
- **Europe:** UK, Germany, France, Spain, Italy, Netherlands
- **Asia-Pacific:** Australia, Japan, Singapore, India
- **Latin America:** Brazil, Argentina, Chile, Colombia
- **Middle East:** UAE, Saudi Arabia, Israel

### **Coverage Requirements**
- **SMS:** 99.9% delivery rate
- **Voice:** 99.5% delivery rate
- **WhatsApp:** 99.8% delivery rate
- **Flash Call:** 99.7% delivery rate

---

## 📊 **Monitoring & Analytics**

### **Available Metrics**
- **Verification Volume:** Daily, weekly, monthly
- **Success Rates:** By method, country, time
- **Response Times:** API and delivery times
- **Error Rates:** By error type and frequency
- **Fraud Detection:** Risk scores and blocked attempts

### **Real-time Monitoring**
- **Live Dashboard:** Real-time metrics and alerts
- **Custom Alerts:** Configurable threshold alerts
- **API Health:** Service status and performance
- **Security Events:** Fraud and security alerts

---

## 🛠️ **SDKs & Libraries**

### **Official SDKs**
- **JavaScript/Node.js:** `npm install @tetrix/2fa-sdk`
- **Python:** `pip install tetrix-2fa-sdk`
- **PHP:** `composer require tetrix/2fa-sdk`
- **Java:** `implementation 'com.tetrix:2fa-sdk:2.0.0'`
- **C#:** `Install-Package Tetrix.2FA.SDK`

### **Community Libraries**
- **Go:** `go get github.com/tetrix/2fa-go`
- **Ruby:** `gem install tetrix-2fa`
- **Swift:** `pod 'Tetrix2FA'`
- **Kotlin:** `implementation 'com.tetrix:2fa-kotlin:2.0.0'`

---

## 📞 **Support & Resources**

### **Documentation**
- **API Reference:** https://docs.tetrixcorp.com/api
- **Integration Guide:** https://docs.tetrixcorp.com/integration
- **SDK Documentation:** https://docs.tetrixcorp.com/sdk
- **Webhook Guide:** https://docs.tetrixcorp.com/webhooks

### **Support Channels**
- **Email:** support@tetrixcorp.com
- **Phone:** +1 (555) 123-4567
- **Slack:** #tetrix-support
- **Status Page:** https://status.tetrixcorp.com

### **Community**
- **GitHub:** https://github.com/tetrixcorp
- **Stack Overflow:** `tetrix-2fa` tag
- **Developer Forum:** https://forum.tetrixcorp.com

---

*This API reference is maintained by TETRIX Corporation. For the latest updates, visit https://docs.tetrixcorp.com/api.*
