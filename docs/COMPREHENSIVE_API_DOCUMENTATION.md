# 🚀 Comprehensive API Documentation for TETRIX Platform

**Last Updated:** January 10, 2025  
**Base URL:** `http://localhost:4321`  
**Environment:** Development

## 📋 Overview

This document provides a complete inventory of all API endpoints available in the TETRIX platform, organized by service category and functionality. Each endpoint includes detailed request/response specifications for comprehensive Postman testing.

## 🏗️ Architecture

The TETRIX platform uses a multi-layered API architecture:

- **Frontend API (Astro)** - Port 4321 - Web-facing endpoints
- **Backend API Service** - Port 4000 - Business logic and data management
- **Voice Services** - Telnyx integration for voice calls
- **Authentication** - 2FA and industry-specific auth
- **Webhooks** - External service integrations

---

## 🔐 Authentication APIs

### 2FA Authentication (v2)

#### **POST** `/api/v2/2fa/initiate`
**Purpose:** Initiate 2FA verification via SMS, Voice, or WhatsApp

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",
  "method": "sms|voice|whatsapp|flashcall",
  "userAgent": "Mozilla/5.0...",
  "ipAddress": "192.168.1.1",
  "sessionId": "session_abc123",
  "customCode": "123456",
  "timeoutSecs": 300
}
```

**Response (Success):**
```json
{
  "success": true,
  "verificationId": "ver_abc123",
  "message": "Verification SMS sent successfully",
  "estimatedDelivery": "30-60 seconds",
  "timestamp": "2025-01-10T16:30:00.000Z"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Phone number is required",
  "status": 400,
  "timestamp": "2025-01-10T16:30:00.000Z"
}
```

#### **POST** `/api/v2/2fa/verify`
**Purpose:** Verify 2FA code

**Request Body:**
```json
{
  "verificationId": "ver_abc123",
  "code": "123456",
  "phoneNumber": "+1234567890"
}
```

**Response (Success):**
```json
{
  "success": true,
  "verified": true,
  "verificationId": "ver_abc123",
  "phoneNumber": "+1234567890",
  "responseCode": "accepted",
  "timestamp": "2025-01-10T16:32:15.000Z",
  "riskLevel": "low",
  "token": "tetrix_auth_1640995200000_abc123"
}
```

#### **GET** `/api/v2/2fa/status`
**Purpose:** Check verification status

**Query Parameters:**
- `verificationId` (required)
- `phoneNumber` (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "verificationId": "ver_abc123",
    "phoneNumber": "+1234567890",
    "status": "pending|verified|expired|failed",
    "method": "sms",
    "createdAt": "2025-01-10T16:30:00.000Z",
    "expiresAt": "2025-01-10T16:35:00.000Z"
  }
}
```

#### **GET** `/api/v2/2fa/audit`
**Purpose:** Get audit logs for phone number

**Query Parameters:**
- `phoneNumber` (required)
- `limit` (optional, default: 10)
- `offset` (optional, default: 0)

**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "id": "log_abc123",
      "phoneNumber": "+1234567890",
      "action": "initiate|verify|resend",
      "status": "success|failed",
      "timestamp": "2025-01-10T16:30:00.000Z",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0..."
    }
  ],
  "total": 25,
  "limit": 10,
  "offset": 0
}
```

### Industry Authentication

#### **POST** `/api/v2/industry-auth/initiate`
**Purpose:** Initiate industry-specific authentication

**Request Body:**
```json
{
  "industry": "healthcare|construction|logistics|government|education|retail|hospitality|wellness|beauty|legal",
  "role": "doctor|nurse|admin|receptionist|project_manager|site_supervisor|safety_officer|foreman|fleet_manager|dispatcher|driver|operations|department_head|citizen_services|emergency_services|permit_office|principal|teacher|parent|store_manager|sales_associate|inventory|customer_service|general_manager|front_desk|concierge|guest_services|facility_manager|trainer|nutritionist|salon_manager|stylist|esthetician|partner|associate|paralegal",
  "organization": "Organization Name",
  "phoneNumber": "+1234567890",
  "verificationCode": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "industry": "healthcare",
  "role": "doctor",
  "organization": "Test Hospital",
  "phoneNumber": "+1234567890",
  "authToken": "industry_auth_1640995200000_abc123",
  "dashboardUrl": "/dashboards/healthcare",
  "permissions": ["read_patients", "write_patients", "view_analytics"],
  "timestamp": "2025-01-10T16:30:00.000Z"
}
```

#### **POST** `/api/v2/industry-auth/verify`
**Purpose:** Verify industry authentication

**Request Body:**
```json
{
  "authToken": "industry_auth_1640995200000_abc123",
  "verificationCode": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "industry": "healthcare",
  "role": "doctor",
  "organization": "Test Hospital",
  "permissions": ["read_patients", "write_patients", "view_analytics"],
  "expiresAt": "2025-01-10T18:30:00.000Z"
}
```

---

## 📞 Voice APIs

### Call Management

#### **POST** `/api/voice/initiate`
**Purpose:** Initiate a voice call

**Request Body:**
```json
{
  "to": "+1234567890",
  "from": "+1987654321",
  "webhookUrl": "https://tetrixcorp.com/webhooks/voice",
  "recordCall": true,
  "transcriptionEnabled": true,
  "language": "en-US",
  "timeout": 30,
  "maxDuration": 300
}
```

**Response (Success):**
```json
{
  "success": true,
  "sessionId": "session_abc123",
  "callId": "call_abc123",
  "phoneNumber": "+1234567890",
  "status": "initiated",
  "startTime": "2025-01-10T16:30:00.000Z",
  "message": "Voice call initiated successfully"
}
```

#### **GET** `/api/voice/sessions`
**Purpose:** Get active voice sessions

**Response:**
```json
{
  "success": true,
  "sessions": [
    {
      "sessionId": "session_abc123",
      "callId": "call_abc123",
      "from": "+1987654321",
      "to": "+1234567890",
      "status": "active|completed|failed",
      "startTime": "2025-01-10T16:30:00.000Z",
      "duration": 120,
      "recordUrl": "https://recordings.telnyx.com/abc123.wav"
    }
  ],
  "total": 1
}
```

#### **GET** `/api/voice/sessions/{sessionId}`
**Purpose:** Get specific session details

**Response:**
```json
{
  "success": true,
  "session": {
    "sessionId": "session_abc123",
    "callId": "call_abc123",
    "from": "+1987654321",
    "to": "+1234567890",
    "status": "active",
    "startTime": "2025-01-10T16:30:00.000Z",
    "endTime": null,
    "duration": 120,
    "recordUrl": "https://recordings.telnyx.com/abc123.wav",
    "transcription": {
      "text": "Hello, this is a test call",
      "confidence": 0.95,
      "language": "en-US"
    }
  }
}
```

#### **POST** `/api/voice/sessions/{sessionId}/end`
**Purpose:** End a voice call

**Response:**
```json
{
  "success": true,
  "sessionId": "session_abc123",
  "status": "ended",
  "endTime": "2025-01-10T16:32:00.000Z",
  "duration": 120,
  "message": "Call ended successfully"
}
```

#### **POST** `/api/voice/cleanup`
**Purpose:** Cleanup old sessions

**Response:**
```json
{
  "success": true,
  "cleanedSessions": 5,
  "message": "Cleanup completed successfully"
}
```

### Transcription Services

#### **POST** `/api/voice/transcribe`
**Purpose:** Process audio transcription

**Request Body:**
```json
{
  "audioUrl": "https://recordings.telnyx.com/abc123.wav",
  "language": "en-US",
  "model": "nova-2",
  "punctuation": true,
  "profanityFilter": false
}
```

**Response:**
```json
{
  "success": true,
  "transcriptionId": "trans_abc123",
  "text": "Hello, this is a test call for TETRIX platform",
  "confidence": 0.95,
  "language": "en-US",
  "duration": 120,
  "wordCount": 10,
  "timestamp": "2025-01-10T16:30:00.000Z"
}
```

#### **GET** `/api/voice/transcribe/{transcriptionId}`
**Purpose:** Get transcription result

**Response:**
```json
{
  "success": true,
  "transcription": {
    "id": "trans_abc123",
    "text": "Hello, this is a test call for TETRIX platform",
    "confidence": 0.95,
    "language": "en-US",
    "duration": 120,
    "wordCount": 10,
    "createdAt": "2025-01-10T16:30:00.000Z",
    "status": "completed"
  }
}
```

#### **POST** `/api/voice/transcribe/batch`
**Purpose:** Batch transcription processing

**Request Body:**
```json
{
  "audioUrls": [
    "https://recordings.telnyx.com/abc123.wav",
    "https://recordings.telnyx.com/def456.wav"
  ],
  "language": "en-US"
}
```

**Response:**
```json
{
  "success": true,
  "batchId": "batch_abc123",
  "transcriptions": [
    {
      "audioUrl": "https://recordings.telnyx.com/abc123.wav",
      "transcriptionId": "trans_abc123",
      "status": "processing"
    }
  ],
  "total": 2,
  "processed": 0,
  "failed": 0
}
```

#### **GET** `/api/voice/transcribe/stats`
**Purpose:** Get transcription statistics

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalTranscriptions": 150,
    "completedTranscriptions": 145,
    "failedTranscriptions": 5,
    "averageConfidence": 0.92,
    "totalDuration": 3600,
    "averageProcessingTime": 2.5
  }
}
```

### Voice Health & Status

#### **GET** `/api/voice/health`
**Purpose:** Voice service health check

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "services": {
    "telnyx": "operational",
    "deepgram": "operational",
    "transcription": "operational"
  },
  "timestamp": "2025-01-10T16:30:00.000Z"
}
```

#### **GET** `/api/voice/transcribe/health`
**Purpose:** Transcription service health check

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "provider": "deepgram",
  "model": "nova-2",
  "uptime": 99.9,
  "timestamp": "2025-01-10T16:30:00.000Z"
}
```

---

## 🔗 Webhook APIs

### Voice Webhooks

#### **POST** `/api/voice/webhook`
**Purpose:** Handle Telnyx voice events

**Request Body:**
```json
{
  "event_type": "call.answered|call.hangup|call.gather.ended",
  "data": {
    "call_control_id": "call_abc123",
    "call_session_id": "session_abc123",
    "from": "+1987654321",
    "to": "+1234567890",
    "direction": "outbound",
    "state": "answered|hangup",
    "digits": "1|2|3|0"
  }
}
```

**Response:** TwiML XML
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Welcome to TETRIX Enterprise Solutions. Press 1 for sales, 2 for support, 3 for billing, or 0 to speak with an operator.</Say>
  <Gather numDigits="1" action="https://tetrixcorp.com/api/voice/webhook" method="POST" timeout="10">
    <Say voice="alice">Please make your selection.</Say>
  </Gather>
  <Say voice="alice">We didn't receive any input. Please call back later. Goodbye.</Say>
  <Hangup/>
</Response>
```

#### **POST** `/api/voice/texml`
**Purpose:** TeXML response handler

**Request Body:**
```json
{
  "sessionId": "session_abc123",
  "action": "gather|say|dial|hangup",
  "data": {
    "message": "Please make your selection",
    "digits": 1,
    "timeout": 10
  }
}
```

**Response:** TwiML XML

#### **POST** `/api/webhooks/telnyx/verify`
**Purpose:** Verify Telnyx webhook signatures

**Request Body:**
```json
{
  "signature": "sha256=abc123...",
  "timestamp": "1640995200",
  "body": "webhook_payload"
}
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "timestamp": "2025-01-10T16:30:00.000Z"
}
```

---

## 📊 Analytics & Monitoring APIs

### Performance Metrics

#### **GET** `/api/performance/metrics`
**Purpose:** Get system performance metrics

**Response:**
```json
{
  "success": true,
  "metrics": {
    "apiCalls": {
      "total": 1500,
      "successful": 1450,
      "failed": 50,
      "successRate": 96.7
    },
    "responseTime": {
      "average": 250,
      "p95": 500,
      "p99": 1000
    },
    "activeUsers": 25,
    "systemLoad": 0.65,
    "memoryUsage": 0.45,
    "timestamp": "2025-01-10T16:30:00.000Z"
  }
}
```

#### **GET** `/api/health/check`
**Purpose:** System health check

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "services": {
    "database": "operational",
    "redis": "operational",
    "voice": "operational",
    "auth": "operational"
  },
  "uptime": 99.9,
  "timestamp": "2025-01-10T16:30:00.000Z"
}
```

#### **POST** `/api/errors/report`
**Purpose:** Report system errors

**Request Body:**
```json
{
  "error": "Database connection failed",
  "level": "error|warning|info",
  "service": "database",
  "userId": "user_abc123",
  "sessionId": "session_abc123",
  "metadata": {
    "query": "SELECT * FROM users",
    "duration": 5000
  }
}
```

**Response:**
```json
{
  "success": true,
  "errorId": "err_abc123",
  "message": "Error reported successfully",
  "timestamp": "2025-01-10T16:30:00.000Z"
}
```

---

## 📞 Contact & Communication APIs

### Contact Management

#### **POST** `/api/contact`
**Purpose:** Submit contact form

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Acme Corp",
  "message": "Interested in your services",
  "industry": "healthcare",
  "priority": "high|medium|low"
}
```

**Response:**
```json
{
  "success": true,
  "id": "contact_abc123",
  "message": "Contact form submitted successfully",
  "ticketNumber": "TKT-2025-001",
  "estimatedResponseTime": "24 hours",
  "timestamp": "2025-01-10T16:30:00.000Z"
}
```

#### **GET** `/api/contacts`
**Purpose:** Get all contacts (admin)

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20)
- `status` (optional: pending|responded|closed)
- `industry` (optional)

**Response:**
```json
{
  "success": true,
  "contacts": [
    {
      "id": "contact_abc123",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "company": "Acme Corp",
      "status": "pending",
      "priority": "high",
      "createdAt": "2025-01-10T16:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

#### **POST** `/api/contacts/validate-phone`
**Purpose:** Validate phone number format

**Request Body:**
```json
{
  "phoneNumber": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "formatted": "+1234567890",
  "country": "US",
  "carrier": "Verizon",
  "type": "mobile"
}
```

---

## 🎓 Academy & Learning APIs

### Assignment Management

#### **GET** `/api/academy/assignments`
**Purpose:** Get user assignments

**Query Parameters:**
- `status` (optional: pending|in_progress|completed)
- `course` (optional)
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Response:**
```json
{
  "success": true,
  "assignments": [
    {
      "id": "assign_abc123",
      "title": "Introduction to TETRIX Platform",
      "description": "Learn the basics of TETRIX platform",
      "course": "tetrix-101",
      "status": "pending",
      "dueDate": "2025-01-15T23:59:59.000Z",
      "points": 100,
      "difficulty": "beginner"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 10,
    "pages": 1
  }
}
```

#### **POST** `/api/academy/assignments`
**Purpose:** Create assignment (admin)

**Request Body:**
```json
{
  "title": "Advanced TETRIX Features",
  "description": "Learn advanced features",
  "course": "tetrix-advanced",
  "dueDate": "2025-01-20T23:59:59.000Z",
  "points": 150,
  "difficulty": "intermediate",
  "instructions": "Complete all exercises",
  "resources": ["https://docs.tetrix.com/advanced"]
}
```

**Response:**
```json
{
  "success": true,
  "assignment": {
    "id": "assign_abc123",
    "title": "Advanced TETRIX Features",
    "status": "draft",
    "createdAt": "2025-01-10T16:30:00.000Z"
  }
}
```

#### **GET** `/api/academy/assignments/{assignmentId}`
**Purpose:** Get specific assignment

**Response:**
```json
{
  "success": true,
  "assignment": {
    "id": "assign_abc123",
    "title": "Advanced TETRIX Features",
    "description": "Learn advanced features",
    "course": "tetrix-advanced",
    "status": "active",
    "dueDate": "2025-01-20T23:59:59.000Z",
    "points": 150,
    "difficulty": "intermediate",
    "instructions": "Complete all exercises",
    "resources": ["https://docs.tetrix.com/advanced"],
    "submissions": 5,
    "averageScore": 85
  }
}
```

#### **POST** `/api/academy/assignments/{assignmentId}/submit`
**Purpose:** Submit assignment

**Request Body:**
```json
{
  "answers": {
    "question1": "Answer to question 1",
    "question2": "Answer to question 2"
  },
  "attachments": ["file1.pdf", "file2.jpg"],
  "notes": "Additional notes"
}
```

**Response:**
```json
{
  "success": true,
  "submission": {
    "id": "sub_abc123",
    "assignmentId": "assign_abc123",
    "status": "submitted",
    "submittedAt": "2025-01-10T16:30:00.000Z",
    "score": null
  }
}
```

#### **GET** `/api/academy/courses`
**Purpose:** Get available courses

**Response:**
```json
{
  "success": true,
  "courses": [
    {
      "id": "tetrix-101",
      "title": "TETRIX Platform Basics",
      "description": "Introduction to TETRIX platform",
      "level": "beginner",
      "duration": "2 weeks",
      "assignments": 5,
      "enrolled": 25
    }
  ]
}
```

#### **GET** `/api/academy/leaderboard`
**Purpose:** Get leaderboard

**Query Parameters:**
- `period` (optional: week|month|all, default: month)
- `limit` (optional, default: 10)

**Response:**
```json
{
  "success": true,
  "leaderboard": [
    {
      "rank": 1,
      "userId": "user_abc123",
      "name": "John Doe",
      "points": 1500,
      "assignmentsCompleted": 10,
      "averageScore": 95
    }
  ],
  "period": "month",
  "totalParticipants": 50
}
```

#### **GET** `/api/academy/progress`
**Purpose:** Get user progress

**Response:**
```json
{
  "success": true,
  "progress": {
    "totalAssignments": 20,
    "completedAssignments": 15,
    "inProgressAssignments": 3,
    "pendingAssignments": 2,
    "totalPoints": 1500,
    "earnedPoints": 1200,
    "averageScore": 88,
    "currentStreak": 5,
    "longestStreak": 12
  }
}
```

---

## 🔧 Testing & Debug APIs

### Test Endpoints

#### **GET** `/api/test`
**Purpose:** Basic API test

**Response:**
```json
{
  "success": true,
  "message": "API is working",
  "timestamp": "2025-01-10T16:30:00.000Z",
  "version": "1.0.0"
}
```

#### **POST** `/api/test`
**Purpose:** Test POST functionality

**Request Body:**
```json
{
  "test": "data",
  "timestamp": "2025-01-10T16:30:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "received": {
    "test": "data",
    "timestamp": "2025-01-10T16:30:00.000Z"
  },
  "message": "POST test successful"
}
```

#### **POST** `/api/test-formdata`
**Purpose:** Test form data handling

**Request:** multipart/form-data
- `file`: File upload
- `text`: Text field
- `number`: Number field

**Response:**
```json
{
  "success": true,
  "formData": {
    "text": "test text",
    "number": "123"
  },
  "files": [
    {
      "name": "test.txt",
      "size": 1024,
      "type": "text/plain"
    }
  ]
}
```

#### **GET** `/api/test/simple`
**Purpose:** Simple test endpoint

**Response:**
```json
{
  "success": true,
  "message": "Simple test passed",
  "timestamp": "2025-01-10T16:30:00.000Z"
}
```

### Debug Endpoints

#### **POST** `/api/debug-request`
**Purpose:** Debug request parsing

**Request Body:**
```json
{
  "test": "debug data",
  "nested": {
    "value": "nested data"
  }
}
```

**Response:**
```json
{
  "success": true,
  "debug": {
    "method": "POST",
    "headers": {
      "content-type": "application/json",
      "user-agent": "PostmanRuntime/7.32.3"
    },
    "body": {
      "test": "debug data",
      "nested": {
        "value": "nested data"
      }
    },
    "parsed": true
  }
}
```

---

## 🔐 Security & Authentication

### JWT & Token Management

#### **GET** `/api/jwks`
**Purpose:** Get JSON Web Key Set

**Response:**
```json
{
  "keys": [
    {
      "kty": "RSA",
      "kid": "key1",
      "use": "sig",
      "n": "base64-encoded-modulus",
      "e": "AQAB"
    }
  ]
}
```

---

## 📈 Dashboard APIs

### Product Management

#### **GET** `/api/dashboard/products/{industry}`
**Purpose:** Get products for specific industry

**Path Parameters:**
- `industry`: healthcare|construction|logistics|government|education|retail|hospitality|wellness|beauty|legal

**Response:**
```json
{
  "success": true,
  "industry": "healthcare",
  "products": [
    {
      "id": "prod_abc123",
      "name": "Patient Management System",
      "description": "Comprehensive patient management",
      "price": 299.99,
      "features": ["patient_records", "appointment_scheduling", "billing"],
      "category": "management"
    }
  ]
}
```

### Cart Management

#### **GET** `/api/dashboard/cart`
**Purpose:** Get user cart

**Response:**
```json
{
  "success": true,
  "cart": {
    "items": [
      {
        "productId": "prod_abc123",
        "name": "Patient Management System",
        "price": 299.99,
        "quantity": 1
      }
    ],
    "total": 299.99,
    "itemCount": 1
  }
}
```

#### **POST** `/api/dashboard/cart/add`
**Purpose:** Add item to cart

**Request Body:**
```json
{
  "productId": "prod_abc123",
  "quantity": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item added to cart",
  "cart": {
    "total": 299.99,
    "itemCount": 1
  }
}
```

#### **POST** `/api/dashboard/cart/remove`
**Purpose:** Remove item from cart

**Request Body:**
```json
{
  "productId": "prod_abc123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item removed from cart",
  "cart": {
    "total": 0,
    "itemCount": 0
  }
}
```

#### **POST** `/api/dashboard/checkout`
**Purpose:** Process checkout

**Request Body:**
```json
{
  "paymentMethod": "card",
  "billingAddress": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zip": "12345",
    "country": "US"
  }
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "order_abc123",
  "total": 299.99,
  "status": "processing",
  "estimatedDelivery": "2025-01-15T16:30:00.000Z"
}
```

---

## 🎯 Demo & Capabilities APIs

### Voice Demo

#### **POST** `/api/voice/demo/call`
**Purpose:** Demo call initiation

**Request Body:**
```json
{
  "to": "+1234567890",
  "demoType": "sales|support|billing|operator"
}
```

**Response:**
```json
{
  "success": true,
  "demoSessionId": "demo_abc123",
  "message": "Demo call initiated",
  "instructions": "Follow the voice prompts to test the system"
}
```

#### **POST** `/api/voice/demo/texml`
**Purpose:** Demo TeXML response

**Request Body:**
```json
{
  "action": "gather|say|dial",
  "data": {
    "message": "Welcome to TETRIX demo"
  }
}
```

**Response:** TwiML XML

#### **POST** `/api/voice/demo/transcribe`
**Purpose:** Demo transcription

**Request Body:**
```json
{
  "audioUrl": "https://demo-audio.tetrix.com/sample.wav"
}
```

**Response:**
```json
{
  "success": true,
  "transcription": "This is a demo transcription",
  "confidence": 0.95
}
```

#### **POST** `/api/voice/demo/ai-response`
**Purpose:** Demo AI response generation

**Request Body:**
```json
{
  "message": "Hello, I need help with billing",
  "context": "customer_support"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Hello! I'd be happy to help you with your billing inquiry. Let me connect you with our billing specialist.",
  "confidence": 0.92,
  "intent": "billing_support"
}
```

#### **POST** `/api/voice/demo/voice-flow`
**Purpose:** Demo complete voice flow

**Request Body:**
```json
{
  "scenario": "customer_support|sales_inquiry|technical_issue"
}
```

**Response:**
```json
{
  "success": true,
  "flowId": "flow_abc123",
  "steps": [
    "greeting",
    "menu_selection",
    "routing",
    "specialist_connection"
  ],
  "estimatedDuration": 300
}
```

#### **GET** `/api/voice/demo/capabilities`
**Purpose:** Get demo capabilities

**Response:**
```json
{
  "success": true,
  "capabilities": {
    "voiceCalls": true,
    "transcription": true,
    "aiResponses": true,
    "webhooks": true,
    "recording": true,
    "languages": ["en-US", "es-ES", "fr-FR"]
  },
  "demoScenarios": [
    "customer_support",
    "sales_inquiry",
    "technical_issue",
    "billing_support"
  ]
}
```

#### **POST** `/api/voice/test/all`
**Purpose:** Run all voice tests

**Response:**
```json
{
  "success": true,
  "tests": [
    {
      "name": "Call Initiation",
      "status": "passed",
      "duration": 1.2
    },
    {
      "name": "Transcription",
      "status": "passed",
      "duration": 2.1
    },
    {
      "name": "AI Response",
      "status": "passed",
      "duration": 0.8
    }
  ],
  "totalTests": 5,
  "passedTests": 5,
  "failedTests": 0,
  "totalDuration": 4.1
}
```

---

## 🌐 Cross-Platform Integration APIs

### Shango Integration

#### **GET** `/api/v1/shango/sessions`
**Purpose:** Get Shango sessions

**Response:**
```json
{
  "success": true,
  "sessions": [
    {
      "id": "shango_abc123",
      "status": "active",
      "createdAt": "2025-01-10T16:30:00.000Z",
      "lastActivity": "2025-01-10T16:35:00.000Z"
    }
  ]
}
```

#### **GET** `/api/v1/shango/sessions/{sessionId}/messages`
**Purpose:** Get session messages

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": "msg_abc123",
      "content": "Hello, how can I help you?",
      "sender": "assistant",
      "timestamp": "2025-01-10T16:30:00.000Z"
    }
  ]
}
```

### Dashboard Metrics

#### **GET** `/api/v1/dashboard/metrics`
**Purpose:** Get dashboard metrics

**Response:**
```json
{
  "success": true,
  "metrics": {
    "totalUsers": 150,
    "activeUsers": 25,
    "totalCalls": 500,
    "totalTranscriptions": 300,
    "systemUptime": 99.9,
    "averageResponseTime": 250
  }
}
```

---

## 🔧 Voice Integration Status

#### **GET** `/api/voice/integration/status`
**Purpose:** Get voice integration status

**Response:**
```json
{
  "success": true,
  "integrations": {
    "telnyx": {
      "status": "connected",
      "lastCheck": "2025-01-10T16:30:00.000Z",
      "credits": 1000
    },
    "deepgram": {
      "status": "connected",
      "lastCheck": "2025-01-10T16:30:00.000Z",
      "requests": 500
    }
  }
}
```

---

## 📝 Postman Collection Structure

### Collection Organization

```
TETRIX Cross-Platform Management Services API Tests
├── 2FA API v2 - Authentication
│   ├── Initiate 2FA Verification (SMS)
│   ├── Initiate 2FA Verification (Voice)
│   ├── Verify 2FA Code (Valid)
│   ├── Verify 2FA Code (Invalid)
│   ├── Check 2FA Status
│   └── Get 2FA Audit Logs
├── Industry Authentication API
│   ├── Industry Auth - Healthcare
│   ├── Industry Auth - Construction
│   └── Industry Auth - Invalid Industry
├── Voice API - Call Management
│   ├── Initiate Voice Call
│   ├── Get Active Sessions
│   ├── Get Session Details
│   ├── End Call
│   └── Cleanup Sessions
├── Voice API - Transcription
│   ├── Process Audio Transcription
│   ├── Get Transcription Result
│   ├── Batch Transcription
│   └── Transcription Statistics
├── Voice API - Health & Status
│   ├── Voice Service Health Check
│   └── Transcription Health Check
├── Webhooks - External Services
│   ├── Telnyx Voice Webhook
│   ├── TeXML Response Handler
│   └── Telnyx Webhook Verification
├── Analytics & Monitoring
│   ├── Performance Metrics
│   ├── System Health Check
│   └── Error Reporting
├── Contact & Communication
│   ├── Submit Contact Form
│   ├── Get All Contacts
│   └── Validate Phone Number
├── Academy & Learning
│   ├── Get Assignments
│   ├── Create Assignment
│   ├── Submit Assignment
│   ├── Get Courses
│   ├── Get Leaderboard
│   └── Get Progress
├── Testing & Debug
│   ├── Basic API Test
│   ├── POST Test
│   ├── Form Data Test
│   └── Debug Request
└── Demo & Capabilities
    ├── Demo Call Initiation
    ├── Demo TeXML Response
    ├── Demo Transcription
    ├── Demo AI Response
    ├── Demo Voice Flow
    ├── Get Demo Capabilities
    └── Run All Tests
```

---

## 🚀 Testing Guidelines

### Environment Variables

```json
{
  "baseUrl": "http://localhost:4321",
  "testPhone": "+1234567890",
  "testSessionId": "test_session_123",
  "verificationId": "",
  "authToken": "",
  "industryAuthToken": ""
}
```

### Test Execution Order

1. **Health Checks** - Verify system is operational
2. **Authentication** - Test 2FA and industry auth flows
3. **Voice Services** - Test call initiation and management
4. **Transcription** - Test audio processing
5. **Webhooks** - Test external integrations
6. **Analytics** - Test monitoring and metrics
7. **Contact** - Test communication features
8. **Academy** - Test learning management
9. **Demo** - Test demonstration features

### Expected Response Times

- **Health Checks**: < 100ms
- **Authentication**: < 2s
- **Voice Initiation**: < 5s
- **Transcription**: < 10s
- **Webhooks**: < 1s
- **Analytics**: < 500ms
- **Contact**: < 1s
- **Academy**: < 2s

### Error Handling

All endpoints should return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "status": 400,
  "details": {
    "field": "specific error details"
  },
  "timestamp": "2025-01-10T16:30:00.000Z"
}
```

---

## 📞 Support & Troubleshooting

### Common Issues

1. **404 Not Found** - Check endpoint URL and server status
2. **400 Bad Request** - Validate request body format
3. **500 Internal Server Error** - Check server logs and configuration
4. **Timeout** - Verify network connectivity and server performance

### Debugging Tips

1. Enable Postman Console for detailed logging
2. Check request/response headers
3. Validate JSON format
4. Test with minimal payloads first
5. Use health check endpoints to verify service status

---

**This documentation covers all available API endpoints in the TETRIX platform. Use this as a reference for comprehensive Postman testing and API integration.**
