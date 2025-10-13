# ⚖️ TETRIX Legal API Reference
**Complete API Documentation for Legal Services**

**Version:** 2.0  
**Date:** January 10, 2025  
**Base URL:** `https://tetrixcorp.com/api/v1/legal`

---

## 📋 **Table of Contents**

1. [Authentication](#authentication)
2. [AI Legal Assistant Services](#ai-legal-assistant-services)
3. [Client Intake Management](#client-intake-management)
4. [Case Management](#case-management)
5. [Document Automation](#document-automation)
6. [Legal Research](#legal-research)
7. [Appointment Management](#appointment-management)
8. [Client Communication](#client-communication)
9. [Time Tracking & Billing](#time-tracking--billing)
10. [Webhooks](#webhooks)
11. [Error Handling](#error-handling)
12. [Rate Limits](#rate-limits)

---

## 🔐 **Authentication**

All API requests require legal-specific authentication:

```http
Authorization: Bearer YOUR_LEGAL_API_KEY
Content-Type: application/json
X-Legal-Firm-ID: YOUR_FIRM_ID
X-Attorney-ID: YOUR_ATTORNEY_ID
```

### **API Key Management**
- **Sandbox Key:** For testing and development
- **Production Key:** For live legal operations
- **Key Rotation:** Required every 90 days for security
- **Scopes:** Configure based on required legal permissions

---

## 🤖 **AI Legal Assistant Services**

### **Initiate Legal Assistant Session**
Start an AI-powered legal assistant session for client interactions.

**Endpoint:** `POST /legal-assistants/sessions`

**Request Body:**
```json
{
  "sessionId": "SESSION_001",
  "clientId": "CLIENT_001",
  "attorneyId": "ATTY_001",
  "sessionType": "client_intake",
  "communicationMethod": "voice_call",
  "clientPhoneNumber": "+1234567890",
  "preferredLanguage": "en-US",
  "sessionConfiguration": {
    "maxDuration": 1800,
    "recordingEnabled": true,
    "transcriptionEnabled": true,
    "aiPersonality": "professional_legal",
    "confidentialityNotice": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "SESSION_001",
  "status": "initiated",
  "estimatedStartTime": "2025-01-10T17:00:00.000Z",
  "sessionDetails": {
    "clientName": "John Doe",
    "attorneyName": "Jane Smith, Esq.",
    "sessionType": "client_intake",
    "communicationMethod": "voice_call"
  },
  "aiAssistantCapabilities": [
    "case_assessment",
    "conflict_check",
    "fee_structure_discussion",
    "document_collection",
    "appointment_scheduling"
  ],
  "confidentialityNotice": "This conversation is protected by attorney-client privilege"
}
```

### **Get Session Status**
Retrieve the current status of a legal assistant session.

**Endpoint:** `GET /legal-assistants/sessions/{sessionId}`

**Response:**
```json
{
  "success": true,
  "sessionId": "SESSION_001",
  "status": "active",
  "currentStep": "collecting_case_details",
  "progress": 65,
  "sessionData": {
    "clientResponses": [
      {
        "question": "What type of legal matter do you need assistance with?",
        "response": "I was injured in a car accident",
        "timestamp": "2025-01-10T17:05:00.000Z"
      }
    ],
    "aiInsights": {
      "confidence": 95,
      "nextRecommendedAction": "collect_incident_details",
      "potentialConflicts": [],
      "caseStrength": "strong"
    }
  },
  "estimatedCompletionTime": "2025-01-10T17:30:00.000Z"
}
```

---

## 👥 **Client Intake Management**

### **Initiate Client Intake**
Automatically initiate client intake process with AI-powered questionnaires.

**Endpoint:** `POST /client-intake/initiate`

**Request Body:**
```json
{
  "intakeId": "INTAKE_001",
  "clientId": "CLIENT_001",
  "attorneyId": "ATTY_001",
  "practiceArea": "personal_injury",
  "intakeType": "initial_consultation",
  "communicationMethod": "voice_call",
  "clientPhoneNumber": "+1234567890",
  "preferredLanguage": "en-US",
  "intakeConfiguration": {
    "maxDuration": 1800,
    "recordingEnabled": true,
    "transcriptionEnabled": true,
    "aiPersonality": "professional_legal",
    "confidentialityNotice": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "intakeId": "INTAKE_001",
  "status": "initiated",
  "estimatedStartTime": "2025-01-10T17:00:00.000Z",
  "intakeDetails": {
    "clientName": "John Doe",
    "attorneyName": "Jane Smith, Esq.",
    "practiceArea": "personal_injury",
    "intakeType": "initial_consultation"
  },
  "aiAssistantCapabilities": [
    "case_assessment",
    "conflict_check",
    "fee_structure_discussion",
    "document_collection",
    "appointment_scheduling"
  ],
  "confidentialityNotice": "This conversation is protected by attorney-client privilege"
}
```

### **Get Intake Results**
Retrieve the results of a completed client intake.

**Endpoint:** `GET /client-intake/{intakeId}/results`

**Response:**
```json
{
  "success": true,
  "intakeId": "INTAKE_001",
  "status": "completed",
  "completedDate": "2025-01-10T17:30:00.000Z",
  "intakeResults": {
    "clientInfo": {
      "name": "John Doe",
      "phone": "+1234567890",
      "email": "john.doe@email.com",
      "address": "123 Main St, New York, NY 10001"
    },
    "caseDetails": {
      "practiceArea": "personal_injury",
      "incidentDate": "2025-01-01",
      "incidentLocation": "123 Main St, New York, NY",
      "description": "Client injured in rear-end collision",
      "injuries": ["whiplash", "back_pain"],
      "damages": {
        "medicalExpenses": 15000,
        "lostWages": 5000,
        "propertyDamage": 3000
      }
    },
    "conflictCheck": {
      "conflictsFound": false,
      "checkedParties": ["ABC Insurance", "John Smith"],
      "recommendation": "No conflicts identified"
    },
    "caseAssessment": {
      "caseStrength": "strong",
      "estimatedValue": 50000,
      "recommendedAction": "Proceed with representation",
      "nextSteps": [
        "Schedule detailed consultation",
        "Collect medical records",
        "Obtain police report"
      ]
    }
  }
}
```

---

## 📁 **Case Management**

### **Create New Case**
Create a new legal case with comprehensive case details.

**Endpoint:** `POST /cases`

**Request Body:**
```json
{
  "caseId": "CASE_001",
  "clientId": "CLIENT_001",
  "attorneyId": "ATTY_001",
  "caseType": "personal_injury",
  "caseTitle": "Doe v. ABC Insurance - Motor Vehicle Accident",
  "practiceArea": "personal_injury",
  "caseStatus": "active",
  "priority": "high",
  "caseDetails": {
    "incidentDate": "2025-01-01T00:00:00.000Z",
    "incidentLocation": "123 Main St, New York, NY",
    "description": "Client injured in rear-end collision",
    "injuries": ["whiplash", "back_pain"],
    "damages": {
      "medicalExpenses": 15000,
      "lostWages": 5000,
      "propertyDamage": 3000
    }
  },
  "deadlines": [
    {
      "description": "Statute of limitations",
      "dueDate": "2027-01-01T00:00:00.000Z",
      "priority": "critical"
    }
  ],
  "confidentialityLevel": "attorney_client_privilege"
}
```

**Response:**
```json
{
  "success": true,
  "caseId": "CASE_001",
  "status": "created",
  "caseNumber": "2025-PI-001",
  "createdDate": "2025-01-10T16:30:00.000Z",
  "caseDetails": {
    "caseTitle": "Doe v. ABC Insurance - Motor Vehicle Accident",
    "practiceArea": "personal_injury",
    "caseStatus": "active",
    "priority": "high"
  },
  "nextSteps": [
    "Schedule client meeting",
    "Collect medical records",
    "Obtain police report",
    "Send demand letter"
  ],
  "deadlines": [
    {
      "description": "Statute of limitations",
      "dueDate": "2027-01-01T00:00:00.000Z",
      "priority": "critical",
      "daysRemaining": 720
    }
  ]
}
```

### **Get Case Details**
Retrieve comprehensive details of a specific case.

**Endpoint:** `GET /cases/{caseId}`

**Response:**
```json
{
  "success": true,
  "caseId": "CASE_001",
  "caseNumber": "2025-PI-001",
  "clientId": "CLIENT_001",
  "attorneyId": "ATTY_001",
  "caseType": "personal_injury",
  "caseTitle": "Doe v. ABC Insurance - Motor Vehicle Accident",
  "caseStatus": "active",
  "priority": "high",
  "caseDetails": {
    "incidentDate": "2025-01-01T00:00:00.000Z",
    "incidentLocation": "123 Main St, New York, NY",
    "description": "Client injured in rear-end collision",
    "injuries": ["whiplash", "back_pain"],
    "damages": {
      "medicalExpenses": 15000,
      "lostWages": 5000,
      "propertyDamage": 3000
    }
  },
  "timeline": [
    {
      "date": "2025-01-10T16:30:00.000Z",
      "event": "Case created",
      "description": "Initial case setup completed"
    }
  ],
  "documents": [
    {
      "documentId": "DOC_001",
      "name": "Client Intake Form",
      "type": "intake_form",
      "uploadDate": "2025-01-10T16:30:00.000Z"
    }
  ],
  "deadlines": [
    {
      "description": "Statute of limitations",
      "dueDate": "2027-01-01T00:00:00.000Z",
      "priority": "critical",
      "daysRemaining": 720
    }
  ]
}
```

### **Update Case Status**
Update the status of an existing case.

**Endpoint:** `PUT /cases/{caseId}/status`

**Request Body:**
```json
{
  "caseStatus": "settlement_negotiation",
  "statusNotes": "Entering settlement negotiations with insurance company",
  "updatedBy": "ATTY_001",
  "updatedDate": "2025-01-10T16:30:00.000Z"
}
```

---

## 📄 **Document Automation**

### **Generate Legal Document**
Generate legal documents using AI-powered templates.

**Endpoint:** `POST /documents/generate`

**Request Body:**
```json
{
  "documentId": "DOC_001",
  "documentType": "retainer_agreement",
  "caseId": "CASE_001",
  "clientId": "CLIENT_001",
  "attorneyId": "ATTY_001",
  "templateId": "retainer_agreement_template",
  "documentData": {
    "clientName": "John Doe",
    "attorneyName": "Jane Smith, Esq.",
    "firmName": "Smith & Associates",
    "caseDescription": "Personal injury claim arising from motor vehicle accident",
    "feeStructure": {
      "type": "contingency",
      "percentage": 33.33,
      "expenses": "client_responsible"
    },
    "scopeOfWork": "Representation in personal injury claim",
    "terminationClause": "Either party may terminate with 30 days notice"
  },
  "format": "pdf",
  "watermark": true,
  "digitalSignature": true
}
```

**Response:**
```json
{
  "success": true,
  "documentId": "DOC_001",
  "status": "generated",
  "documentUrl": "https://docs.tetrixcorp.com/legal/documents/DOC_001.pdf",
  "documentDetails": {
    "documentType": "retainer_agreement",
    "fileName": "Doe_John_Retainer_Agreement_20250110.pdf",
    "fileSize": "245KB",
    "pageCount": 5,
    "generatedDate": "2025-01-10T16:30:00.000Z"
  },
  "signatureRequired": true,
  "signatureDeadline": "2025-01-17T00:00:00.000Z",
  "nextSteps": [
    "Review document for accuracy",
    "Send to client for signature",
    "Schedule signing appointment"
  ]
}
```

### **Get Document Status**
Check the status of a generated document.

**Endpoint:** `GET /documents/{documentId}/status`

**Response:**
```json
{
  "success": true,
  "documentId": "DOC_001",
  "status": "signed",
  "documentUrl": "https://docs.tetrixcorp.com/legal/documents/DOC_001.pdf",
  "signatureStatus": "completed",
  "signedDate": "2025-01-12T14:30:00.000Z",
  "signedBy": "John Doe",
  "witnessedBy": "Jane Smith, Esq."
}
```

---

## 🔍 **Legal Research**

### **Search Legal Precedents**
Search for relevant legal precedents and case law.

**Endpoint:** `POST /research/search`

**Request Body:**
```json
{
  "researchId": "RES_001",
  "attorneyId": "ATTY_001",
  "caseId": "CASE_001",
  "searchQuery": "rear-end collision negligence standard of care",
  "jurisdiction": "New York",
  "practiceArea": "personal_injury",
  "dateRange": {
    "startDate": "2020-01-01",
    "endDate": "2025-01-01"
  },
  "searchFilters": {
    "courtLevel": ["appellate", "supreme"],
    "caseType": "civil",
    "relevanceThreshold": 0.8
  }
}
```

**Response:**
```json
{
  "success": true,
  "researchId": "RES_001",
  "status": "completed",
  "searchResults": [
    {
      "caseName": "Smith v. Johnson",
      "citation": "2023 NY App Div 123",
      "court": "New York Appellate Division",
      "date": "2023-06-15",
      "relevanceScore": 0.95,
      "summary": "Appellate court held that rear-end collision creates presumption of negligence",
      "keyHolding": "Defendant failed to rebut presumption of negligence in rear-end collision",
      "url": "https://courts.ny.gov/decisions/2023/2023-06-15-smith-v-johnson.pdf"
    }
  ],
  "totalResults": 15,
  "searchTime": "2.3 seconds",
  "aiInsights": {
    "caseStrength": "strong",
    "keyLegalPrinciples": [
      "Rear-end collision presumption",
      "Negligence standard of care",
      "Damages calculation"
    ],
    "recommendedCitations": [
      "Smith v. Johnson, 2023 NY App Div 123",
      "Brown v. Davis, 2022 NY Sup Ct 456"
    ]
  }
}
```

---

## 📅 **Appointment Management**

### **Schedule Legal Consultation**
Schedule a legal consultation or meeting.

**Endpoint:** `POST /appointments/schedule`

**Request Body:**
```json
{
  "appointmentId": "APT_001",
  "clientId": "CLIENT_001",
  "attorneyId": "ATTY_001",
  "caseId": "CASE_001",
  "appointmentType": "initial_consultation",
  "scheduledDate": "2025-01-15T14:00:00.000Z",
  "duration": 60,
  "location": {
    "name": "Smith & Associates Law Firm",
    "address": "123 Legal Plaza, Suite 200, New York, NY 10001",
    "room": "Conference Room A",
    "phone": "+1234567890"
  },
  "communicationPreferences": {
    "reminderMethod": "voice_call",
    "reminderTime": "24_hours",
    "confirmationRequired": true,
    "preferredLanguage": "en-US"
  },
  "appointmentDetails": {
    "purpose": "Initial consultation for personal injury case",
    "preparationRequired": [
      "Bring medical records",
      "Bring police report",
      "Bring insurance information"
    ],
    "confidentialityNotice": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "appointmentId": "APT_001",
  "status": "scheduled",
  "confirmationNumber": "CONF20250115001",
  "scheduledDate": "2025-01-15T14:00:00.000Z",
  "clientInfo": {
    "name": "John Doe",
    "phone": "+1234567890",
    "email": "john.doe@email.com"
  },
  "attorneyInfo": {
    "name": "Jane Smith, Esq.",
    "phone": "+1234567891",
    "email": "jane.smith@smithlaw.com"
  },
  "reminders": [
    {
      "type": "confirmation",
      "scheduledTime": "2025-01-14T14:00:00.000Z",
      "method": "voice_call"
    },
    {
      "type": "reminder",
      "scheduledTime": "2025-01-15T08:00:00.000Z",
      "method": "voice_call"
    }
  ],
  "preparationInstructions": [
    "Bring medical records",
    "Bring police report",
    "Bring insurance information"
  ]
}
```

---

## 📞 **Client Communication**

### **Send Client Communication**
Send secure communication to clients.

**Endpoint:** `POST /communications/send`

**Request Body:**
```json
{
  "communicationId": "COMM_001",
  "clientId": "CLIENT_001",
  "attorneyId": "ATTY_001",
  "caseId": "CASE_001",
  "communicationType": "case_update",
  "subject": "Update on Your Personal Injury Case",
  "message": "I wanted to update you on the progress of your personal injury case. We have received the police report and are currently reviewing your medical records. I will schedule a follow-up meeting once we have completed our initial review.",
  "deliveryMethod": "email",
  "scheduledTime": "2025-01-14T18:00:00.000Z",
  "priority": "normal",
  "confidentialityNotice": true,
  "attachments": [
    {
      "documentId": "DOC_002",
      "name": "Case Status Report",
      "type": "pdf"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "communicationId": "COMM_001",
  "status": "scheduled",
  "deliveryMethod": "email",
  "scheduledTime": "2025-01-14T18:00:00.000Z",
  "estimatedDeliveryTime": "2025-01-14T18:05:00.000Z",
  "clientInfo": {
    "name": "John Doe",
    "email": "john.doe@email.com"
  },
  "confidentialityNotice": "This communication is protected by attorney-client privilege"
}
```

---

## ⏰ **Time Tracking & Billing**

### **Log Billable Time**
Log billable time for cases and clients.

**Endpoint:** `POST /time-tracking/log`

**Request Body:**
```json
{
  "timeEntryId": "TIME_001",
  "attorneyId": "ATTY_001",
  "caseId": "CASE_001",
  "clientId": "CLIENT_001",
  "date": "2025-01-10",
  "startTime": "14:00:00",
  "endTime": "15:30:00",
  "duration": 90,
  "description": "Client consultation - case strategy discussion",
  "activityType": "client_meeting",
  "billable": true,
  "hourlyRate": 350,
  "totalAmount": 525.00,
  "notes": "Discussed case strategy and next steps with client"
}
```

**Response:**
```json
{
  "success": true,
  "timeEntryId": "TIME_001",
  "status": "logged",
  "timeEntry": {
    "date": "2025-01-10",
    "duration": 90,
    "description": "Client consultation - case strategy discussion",
    "activityType": "client_meeting",
    "billable": true,
    "hourlyRate": 350,
    "totalAmount": 525.00
  },
  "monthlyTotal": {
    "totalHours": 45.5,
    "totalBillableHours": 42.0,
    "totalAmount": 14700.00
  }
}
```

### **Generate Invoice**
Generate invoices for clients.

**Endpoint:** `POST /billing/invoices/generate`

**Request Body:**
```json
{
  "invoiceId": "INV_001",
  "clientId": "CLIENT_001",
  "attorneyId": "ATTY_001",
  "caseId": "CASE_001",
  "billingPeriod": {
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  },
  "timeEntries": ["TIME_001", "TIME_002", "TIME_003"],
  "expenses": [
    {
      "description": "Court filing fee",
      "amount": 150.00,
      "date": "2025-01-15"
    }
  ],
  "paymentTerms": "Net 30",
  "dueDate": "2025-02-28"
}
```

**Response:**
```json
{
  "success": true,
  "invoiceId": "INV_001",
  "status": "generated",
  "invoiceNumber": "INV-2025-001",
  "invoiceUrl": "https://billing.tetrixcorp.com/invoices/INV_001.pdf",
  "invoiceDetails": {
    "clientName": "John Doe",
    "attorneyName": "Jane Smith, Esq.",
    "caseTitle": "Doe v. ABC Insurance - Motor Vehicle Accident",
    "billingPeriod": "January 1-31, 2025",
    "subtotal": 1575.00,
    "expenses": 150.00,
    "total": 1725.00,
    "dueDate": "2025-02-28"
  },
  "timeEntries": [
    {
      "date": "2025-01-10",
      "description": "Client consultation - case strategy discussion",
      "hours": 1.5,
      "rate": 350.00,
      "amount": 525.00
    }
  ],
  "nextSteps": [
    "Review invoice for accuracy",
    "Send to client",
    "Track payment status"
  ]
}
```

---

## 🔔 **Webhooks**

### **Legal Events Webhook**
Receives real-time legal events and notifications.

**Endpoint:** `POST /webhooks/events`

**Supported Events:**
- `client.intake_completed` - Client intake process completed
- `case.created` - New case created
- `case.status_changed` - Case status updated
- `appointment.scheduled` - Appointment scheduled
- `appointment.cancelled` - Appointment cancelled
- `document.generated` - Legal document generated
- `time.logged` - Billable time logged
- `invoice.generated` - Invoice generated
- `deadline.approaching` - Case deadline approaching
- `conflict.detected` - Potential conflict of interest detected

**Webhook Payload Example:**
```json
{
  "eventType": "case.created",
  "clientId": "CLIENT_001",
  "attorneyId": "ATTY_001",
  "firmId": "FIRM_001",
  "data": {
    "caseId": "CASE_001",
    "caseNumber": "2025-PI-001",
    "caseType": "personal_injury",
    "caseStatus": "active",
    "priority": "high"
  },
  "timestamp": "2025-01-10T16:30:00.000Z",
  "priority": "normal"
}
```

---

## ❌ **Error Handling**

### **Error Response Format**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CASE_ID",
    "message": "Case ID not found in system",
    "details": "The case ID CASE_999 does not exist",
    "timestamp": "2025-01-10T16:30:00.000Z",
    "requestId": "REQ_123456789"
  }
}
```

### **Common Error Codes**
- `INVALID_API_KEY` - Invalid or missing API key
- `INVALID_CASE_ID` - Case ID not found
- `INVALID_CLIENT_ID` - Client ID not found
- `INVALID_ATTORNEY_ID` - Attorney ID not found
- `CONFLICT_OF_INTEREST` - Conflict of interest detected
- `PRIVILEGE_VIOLATION` - Attorney-client privilege violation
- `DOCUMENT_GENERATION_FAILED` - Document generation failed
- `BILLING_ERROR` - Billing or invoicing error
- `RATE_LIMIT_EXCEEDED` - Rate limit exceeded
- `INTERNAL_ERROR` - Internal server error

---

## ⚡ **Rate Limits**

### **API Rate Limits**
- **Standard Tier:** 1,000 requests per hour
- **Professional Tier:** 10,000 requests per hour
- **Enterprise Tier:** 100,000 requests per hour
- **Legal Emergency:** 1,000,000 requests per hour

### **Rate Limit Headers**
```http
X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9999
X-RateLimit-Reset: 1641234567
X-RateLimit-Retry-After: 3600
```

---

## 📞 **Support**

### **Legal Support Team**
- **Email:** legal-support@tetrixcorp.com
- **Phone:** +1 (555) 123-LEGAL
- **Hours:** 24/7 Legal Support

### **Compliance & Ethics**
- **Email:** legal-compliance@tetrixcorp.com
- **Phone:** +1 (555) 123-ETHICS
- **Hours:** Business Hours (9 AM - 6 PM EST)

### **API Documentation**
- **Interactive Docs:** https://api.tetrixcorp.com/legal/docs
- **Postman Collection:** Available for download
- **SDK Libraries:** JavaScript, Python, Java, C#

---

*This API reference is part of the TETRIX Legal Platform. For additional support, contact our legal integration team.*
