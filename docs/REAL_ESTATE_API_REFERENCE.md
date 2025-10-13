# 🏠 TETRIX Real Estate API Reference
**Complete API Documentation for Real Estate Services**

**Version:** 2.0  
**Date:** January 10, 2025  
**Base URL:** `https://tetrixcorp.com/api/v1/real-estate`

---

## 📋 **Table of Contents**

1. [Authentication](#authentication)
2. [AI Real Estate Assistant Services](#ai-real-estate-assistant-services)
3. [Lead Management](#lead-management)
4. [Property Management](#property-management)
5. [Transaction Management](#transaction-management)
6. [Market Analysis](#market-analysis)
7. [Appointment Management](#appointment-management)
8. [Client Communication](#client-communication)
9. [Commission & Billing](#commission--billing)
10. [Webhooks](#webhooks)
11. [Error Handling](#error-handling)
12. [Rate Limits](#rate-limits)

---

## 🔐 **Authentication**

All API requests require real estate-specific authentication:

```http
Authorization: Bearer YOUR_REAL_ESTATE_API_KEY
Content-Type: application/json
X-Real-Estate-Agency-ID: YOUR_AGENCY_ID
X-Agent-ID: YOUR_AGENT_ID
```

### **API Key Management**
- **Sandbox Key:** For testing and development
- **Production Key:** For live real estate operations
- **Key Rotation:** Required every 90 days for security
- **Scopes:** Configure based on required real estate permissions

---

## 🤖 **AI Real Estate Assistant Services**

### **Initiate Real Estate Assistant Session**
Start an AI-powered real estate assistant session for client interactions.

**Endpoint:** `POST /real-estate-assistants/sessions`

**Request Body:**
```json
{
  "sessionId": "SESSION_001",
  "clientId": "CLIENT_001",
  "agentId": "AGENT_001",
  "sessionType": "lead_qualification",
  "communicationMethod": "voice_call",
  "clientPhoneNumber": "+1234567890",
  "preferredLanguage": "en-US",
  "sessionConfiguration": {
    "maxDuration": 1200,
    "recordingEnabled": true,
    "transcriptionEnabled": true,
    "aiPersonality": "professional_real_estate",
    "marketAnalysisEnabled": true
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
    "agentName": "Jane Smith",
    "sessionType": "lead_qualification",
    "communicationMethod": "voice_call"
  },
  "aiAssistantCapabilities": [
    "lead_qualification",
    "property_matching",
    "market_analysis",
    "appointment_scheduling",
    "follow_up_automation"
  ]
}
```

### **Get Session Status**
Retrieve the current status of a real estate assistant session.

**Endpoint:** `GET /real-estate-assistants/sessions/{sessionId}`

**Response:**
```json
{
  "success": true,
  "sessionId": "SESSION_001",
  "status": "active",
  "currentStep": "collecting_property_preferences",
  "progress": 65,
  "sessionData": {
    "clientResponses": [
      {
        "question": "What type of property are you looking for?",
        "response": "A 3-bedroom house in downtown area",
        "timestamp": "2025-01-10T17:05:00.000Z"
      }
    ],
    "aiInsights": {
      "confidence": 95,
      "nextRecommendedAction": "collect_budget_information",
      "propertyMatches": 12,
      "marketTrend": "increasing"
    }
  },
  "estimatedCompletionTime": "2025-01-10T17:20:00.000Z"
}
```

---

## 👥 **Lead Management**

### **Initiate Lead Qualification**
Automatically qualify leads and match them with suitable properties using AI.

**Endpoint:** `POST /leads/qualify`

**Request Body:**
```json
{
  "leadId": "LEAD_001",
  "clientId": "CLIENT_001",
  "agentId": "AGENT_001",
  "leadSource": "website_inquiry",
  "propertyType": "residential",
  "clientPhoneNumber": "+1234567890",
  "preferredLanguage": "en-US",
  "qualificationConfiguration": {
    "maxDuration": 1200,
    "recordingEnabled": true,
    "transcriptionEnabled": true,
    "aiPersonality": "professional_real_estate",
    "marketAnalysisEnabled": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "leadId": "LEAD_001",
  "status": "qualified",
  "qualificationScore": 85,
  "leadDetails": {
    "clientName": "John Doe",
    "agentName": "Jane Smith",
    "propertyType": "residential",
    "budgetRange": "$300,000 - $500,000",
    "preferredLocation": "Downtown Area"
  },
  "aiAssistantCapabilities": [
    "lead_qualification",
    "property_matching",
    "market_analysis",
    "appointment_scheduling",
    "follow_up_automation"
  ],
  "nextSteps": [
    "Schedule property showing",
    "Send market analysis report",
    "Set up automated follow-up"
  ]
}
```

### **Get Lead Qualification Results**
Retrieve the results of a completed lead qualification.

**Endpoint:** `GET /leads/{leadId}/qualification`

**Response:**
```json
{
  "success": true,
  "leadId": "LEAD_001",
  "status": "qualified",
  "qualificationScore": 85,
  "qualificationResults": {
    "clientInfo": {
      "name": "John Doe",
      "phone": "+1234567890",
      "email": "john.doe@email.com",
      "address": "123 Main St, New York, NY 10001"
    },
    "propertyPreferences": {
      "propertyType": "residential",
      "budgetRange": "$300,000 - $500,000",
      "preferredLocation": "Downtown Area",
      "bedrooms": 3,
      "bathrooms": 2,
      "squareFootage": "1500-2000",
      "mustHaves": ["garage", "updated_kitchen", "hardwood_floors"]
    },
    "marketAnalysis": {
      "averagePrice": "$425,000",
      "marketTrend": "increasing",
      "daysOnMarket": 45,
      "competitionLevel": "moderate",
      "recommendedStrategy": "competitive_pricing"
    },
    "qualificationAssessment": {
      "buyingPower": "verified",
      "timeline": "3-6 months",
      "motivation": "high",
      "recommendedAction": "Schedule property showing",
      "nextSteps": [
        "Send market analysis report",
        "Schedule property showing",
        "Set up automated follow-up"
      ]
    }
  }
}
```

---

## 🏠 **Property Management**

### **Create Property Listing**
Create a new property listing with comprehensive property details.

**Endpoint:** `POST /properties`

**Request Body:**
```json
{
  "propertyId": "PROP_001",
  "agentId": "AGENT_001",
  "clientId": "CLIENT_001",
  "propertyType": "residential",
  "listingType": "sale",
  "propertyDetails": {
    "address": "123 Main St, New York, NY 10001",
    "bedrooms": 3,
    "bathrooms": 2,
    "squareFootage": 1800,
    "lotSize": "0.25 acres",
    "yearBuilt": 2015,
    "propertyFeatures": ["garage", "updated_kitchen", "hardwood_floors", "fireplace"],
    "description": "Beautiful 3-bedroom home in downtown area with modern amenities"
  },
  "pricing": {
    "listPrice": 450000,
    "pricePerSquareFoot": 250,
    "marketAnalysis": {
      "comparableProperties": 5,
      "averagePrice": 425000,
      "priceRecommendation": "competitive"
    }
  },
  "marketing": {
    "photos": ["photo1.jpg", "photo2.jpg", "photo3.jpg"],
    "virtualTour": "https://virtualtour.example.com/prop001",
    "marketingDescription": "Stunning downtown home with modern updates"
  },
  "mlsInfo": {
    "mlsNumber": "MLS123456",
    "status": "active",
    "listDate": "2025-01-10T00:00:00.000Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "propertyId": "PROP_001",
  "status": "listed",
  "mlsNumber": "MLS123456",
  "listDate": "2025-01-10T00:00:00.000Z",
  "propertyDetails": {
    "address": "123 Main St, New York, NY 10001",
    "propertyType": "residential",
    "listingType": "sale",
    "listPrice": 450000
  },
  "marketingAssets": {
    "photos": ["photo1.jpg", "photo2.jpg", "photo3.jpg"],
    "virtualTour": "https://virtualtour.example.com/prop001",
    "marketingDescription": "Stunning downtown home with modern updates"
  },
  "nextSteps": [
    "Schedule professional photography",
    "Create virtual tour",
    "List on MLS",
    "Set up automated marketing"
  ]
}
```

### **Get Property Details**
Retrieve comprehensive details of a specific property.

**Endpoint:** `GET /properties/{propertyId}`

**Response:**
```json
{
  "success": true,
  "propertyId": "PROP_001",
  "mlsNumber": "MLS123456",
  "agentId": "AGENT_001",
  "clientId": "CLIENT_001",
  "propertyType": "residential",
  "listingType": "sale",
  "status": "active",
  "propertyDetails": {
    "address": "123 Main St, New York, NY 10001",
    "bedrooms": 3,
    "bathrooms": 2,
    "squareFootage": 1800,
    "lotSize": "0.25 acres",
    "yearBuilt": 2015,
    "propertyFeatures": ["garage", "updated_kitchen", "hardwood_floors", "fireplace"]
  },
  "pricing": {
    "listPrice": 450000,
    "pricePerSquareFoot": 250,
    "marketAnalysis": {
      "comparableProperties": 5,
      "averagePrice": 425000,
      "priceRecommendation": "competitive"
    }
  },
  "marketing": {
    "photos": ["photo1.jpg", "photo2.jpg", "photo3.jpg"],
    "virtualTour": "https://virtualtour.example.com/prop001",
    "marketingDescription": "Stunning downtown home with modern updates"
  },
  "performance": {
    "views": 1250,
    "inquiries": 45,
    "showings": 12,
    "offers": 3,
    "daysOnMarket": 15
  }
}
```

### **Update Property Status**
Update the status of an existing property.

**Endpoint:** `PUT /properties/{propertyId}/status`

**Request Body:**
```json
{
  "status": "pending",
  "statusNotes": "Offer accepted, pending inspection",
  "updatedBy": "AGENT_001",
  "updatedDate": "2025-01-15T00:00:00.000Z"
}
```

---

## 📄 **Transaction Management**

### **Create Transaction**
Create a new real estate transaction.

**Endpoint:** `POST /transactions`

**Request Body:**
```json
{
  "transactionId": "TXN_001",
  "propertyId": "PROP_001",
  "clientId": "CLIENT_001",
  "agentId": "AGENT_001",
  "transactionType": "sale",
  "transactionStatus": "pending",
  "transactionDetails": {
    "offerPrice": 435000,
    "offerDate": "2025-01-15T00:00:00.000Z",
    "closingDate": "2025-02-15T00:00:00.000Z",
    "financingType": "conventional",
    "contingencies": ["inspection", "appraisal", "financing"],
    "earnestMoney": 5000
  },
  "parties": {
    "buyer": {
      "name": "John Doe",
      "phone": "+1234567890",
      "email": "john.doe@email.com"
    },
    "seller": {
      "name": "Jane Smith",
      "phone": "+1234567891",
      "email": "jane.smith@email.com"
    }
  },
  "timeline": [
    {
      "milestone": "offer_accepted",
      "dueDate": "2025-01-20T00:00:00.000Z",
      "status": "completed"
    },
    {
      "milestone": "inspection",
      "dueDate": "2025-01-25T00:00:00.000Z",
      "status": "pending"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "transactionId": "TXN_001",
  "status": "created",
  "transactionNumber": "TXN-2025-001",
  "createdDate": "2025-01-15T00:00:00.000Z",
  "transactionDetails": {
    "offerPrice": 435000,
    "closingDate": "2025-02-15T00:00:00.000Z",
    "transactionStatus": "pending"
  },
  "timeline": [
    {
      "milestone": "offer_accepted",
      "dueDate": "2025-01-20T00:00:00.000Z",
      "status": "completed"
    },
    {
      "milestone": "inspection",
      "dueDate": "2025-01-25T00:00:00.000Z",
      "status": "pending"
    }
  ],
  "nextSteps": [
    "Schedule inspection",
    "Order appraisal",
    "Coordinate with lender",
    "Prepare closing documents"
  ]
}
```

### **Get Transaction Details**
Retrieve comprehensive details of a specific transaction.

**Endpoint:** `GET /transactions/{transactionId}`

**Response:**
```json
{
  "success": true,
  "transactionId": "TXN_001",
  "transactionNumber": "TXN-2025-001",
  "propertyId": "PROP_001",
  "clientId": "CLIENT_001",
  "agentId": "AGENT_001",
  "transactionType": "sale",
  "transactionStatus": "pending",
  "transactionDetails": {
    "offerPrice": 435000,
    "offerDate": "2025-01-15T00:00:00.000Z",
    "closingDate": "2025-02-15T00:00:00.000Z",
    "financingType": "conventional",
    "contingencies": ["inspection", "appraisal", "financing"],
    "earnestMoney": 5000
  },
  "parties": {
    "buyer": {
      "name": "John Doe",
      "phone": "+1234567890",
      "email": "john.doe@email.com"
    },
    "seller": {
      "name": "Jane Smith",
      "phone": "+1234567891",
      "email": "jane.smith@email.com"
    }
  },
  "timeline": [
    {
      "milestone": "offer_accepted",
      "dueDate": "2025-01-20T00:00:00.000Z",
      "status": "completed"
    },
    {
      "milestone": "inspection",
      "dueDate": "2025-01-25T00:00:00.000Z",
      "status": "pending"
    }
  ]
}
```

---

## 📊 **Market Analysis**

### **Generate Market Analysis**
Generate comprehensive market analysis for properties.

**Endpoint:** `POST /market-analysis/generate`

**Request Body:**
```json
{
  "analysisId": "ANALYSIS_001",
  "propertyId": "PROP_001",
  "agentId": "AGENT_001",
  "analysisType": "comprehensive",
  "propertyDetails": {
    "address": "123 Main St, New York, NY 10001",
    "bedrooms": 3,
    "bathrooms": 2,
    "squareFootage": 1800,
    "propertyType": "residential"
  },
  "analysisParameters": {
    "radius": 2,
    "timeframe": "6_months",
    "includePending": true,
    "includeSold": true,
    "includeActive": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "analysisId": "ANALYSIS_001",
  "status": "completed",
  "analysisDate": "2025-01-10T00:00:00.000Z",
  "marketAnalysis": {
    "propertyValue": {
      "estimatedValue": 425000,
      "priceRange": {
        "low": 400000,
        "high": 450000
      },
      "pricePerSquareFoot": 236
    },
    "comparableProperties": [
      {
        "address": "125 Main St, New York, NY 10001",
        "soldPrice": 420000,
        "soldDate": "2024-12-15",
        "bedrooms": 3,
        "bathrooms": 2,
        "squareFootage": 1750,
        "daysOnMarket": 30
      }
    ],
    "marketTrends": {
      "averageDaysOnMarket": 45,
      "priceTrend": "increasing",
      "inventoryLevel": "low",
      "marketCondition": "seller_market"
    },
    "recommendations": {
      "listPrice": 435000,
      "marketingStrategy": "competitive_pricing",
      "timeToMarket": "2-4 weeks",
      "keySellingPoints": ["updated_kitchen", "hardwood_floors", "garage"]
    }
  }
}
```

---

## 📅 **Appointment Management**

### **Schedule Property Showing**
Schedule a property showing appointment.

**Endpoint:** `POST /appointments/schedule`

**Request Body:**
```json
{
  "appointmentId": "APT_001",
  "propertyId": "PROP_001",
  "clientId": "CLIENT_001",
  "agentId": "AGENT_001",
  "appointmentType": "property_showing",
  "scheduledDate": "2025-01-20T14:00:00.000Z",
  "duration": 60,
  "location": {
    "propertyAddress": "123 Main St, New York, NY 10001",
    "meetingPoint": "Front door",
    "parkingInstructions": "Street parking available",
    "accessInstructions": "Key in lockbox, code 1234"
  },
  "clientInfo": {
    "name": "John Doe",
    "phone": "+1234567890",
    "email": "john.doe@email.com",
    "preferredContact": "phone"
  },
  "preparationRequired": [
    "Bring valid ID",
    "Arrive 5 minutes early",
    "Wear comfortable shoes"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "appointmentId": "APT_001",
  "status": "scheduled",
  "confirmationNumber": "SHOW20250120001",
  "scheduledDate": "2025-01-20T14:00:00.000Z",
  "propertyInfo": {
    "address": "123 Main St, New York, NY 10001",
    "mlsNumber": "MLS123456",
    "listPrice": 450000
  },
  "clientInfo": {
    "name": "John Doe",
    "phone": "+1234567890",
    "email": "john.doe@email.com"
  },
  "agentInfo": {
    "name": "Jane Smith",
    "phone": "+1234567891",
    "email": "jane.smith@realestate.com"
  },
  "reminders": [
    {
      "type": "confirmation",
      "scheduledTime": "2025-01-19T14:00:00.000Z",
      "method": "phone"
    },
    {
      "type": "reminder",
      "scheduledTime": "2025-01-20T08:00:00.000Z",
      "method": "phone"
    }
  ],
  "preparationInstructions": [
    "Bring valid ID",
    "Arrive 5 minutes early",
    "Wear comfortable shoes"
  ]
}
```

---

## 📞 **Client Communication**

### **Send Client Communication**
Send communication to clients.

**Endpoint:** `POST /communications/send`

**Request Body:**
```json
{
  "communicationId": "COMM_001",
  "clientId": "CLIENT_001",
  "agentId": "AGENT_001",
  "propertyId": "PROP_001",
  "communicationType": "property_update",
  "subject": "New Properties Matching Your Criteria",
  "message": "I found several new properties that match your criteria. I've attached a detailed market analysis and property comparison. Let me know if you'd like to schedule showings for any of these properties.",
  "deliveryMethod": "email",
  "scheduledTime": "2025-01-15T18:00:00.000Z",
  "priority": "normal",
  "attachments": [
    {
      "documentId": "DOC_002",
      "name": "Property Comparison Report",
      "type": "pdf"
    }
  ],
  "followUpRequired": true,
  "followUpDate": "2025-01-18T00:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "communicationId": "COMM_001",
  "status": "scheduled",
  "deliveryMethod": "email",
  "scheduledTime": "2025-01-15T18:00:00.000Z",
  "estimatedDeliveryTime": "2025-01-15T18:05:00.000Z",
  "clientInfo": {
    "name": "John Doe",
    "email": "john.doe@email.com"
  },
  "followUpScheduled": {
    "followUpDate": "2025-01-18T00:00:00.000Z",
    "followUpType": "phone_call"
  }
}
```

---

## 💰 **Commission & Billing**

### **Log Commission**
Log commission earned from transactions.

**Endpoint:** `POST /commissions/log`

**Request Body:**
```json
{
  "commissionId": "COMM_001",
  "agentId": "AGENT_001",
  "transactionId": "TXN_001",
  "propertyId": "PROP_001",
  "clientId": "CLIENT_001",
  "commissionType": "sale",
  "commissionDetails": {
    "salePrice": 435000,
    "commissionRate": 0.03,
    "commissionAmount": 13050,
    "splitRate": 0.5,
    "agentCommission": 6525,
    "brokerCommission": 6525
  },
  "paymentStatus": "pending",
  "closingDate": "2025-02-15T00:00:00.000Z",
  "notes": "Commission from residential sale"
}
```

**Response:**
```json
{
  "success": true,
  "commissionId": "COMM_001",
  "status": "logged",
  "commissionDetails": {
    "salePrice": 435000,
    "commissionAmount": 13050,
    "agentCommission": 6525,
    "brokerCommission": 6525
  },
  "monthlyTotal": {
    "totalCommissions": 19575,
    "totalSales": 2,
    "averageCommission": 9787.5
  }
}
```

### **Generate Commission Report**
Generate commission reports for agents.

**Endpoint:** `POST /commissions/reports/generate`

**Request Body:**
```json
{
  "reportId": "REPORT_001",
  "agentId": "AGENT_001",
  "reportPeriod": {
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  },
  "reportType": "monthly",
  "includeDetails": true
}
```

**Response:**
```json
{
  "success": true,
  "reportId": "REPORT_001",
  "status": "generated",
  "reportUrl": "https://reports.tetrixcorp.com/real-estate/commissions/REPORT_001.pdf",
  "reportDetails": {
    "agentName": "Jane Smith",
    "reportPeriod": "January 1-31, 2025",
    "totalCommissions": 19575,
    "totalSales": 2,
    "averageCommission": 9787.5
  },
  "commissionBreakdown": [
    {
      "transactionId": "TXN_001",
      "propertyAddress": "123 Main St, New York, NY 10001",
      "salePrice": 435000,
      "commissionAmount": 13050,
      "agentCommission": 6525
    }
  ]
}
```

---

## 🔔 **Webhooks**

### **Real Estate Events Webhook**
Receives real-time real estate events and notifications.

**Endpoint:** `POST /webhooks/events`

**Supported Events:**
- `lead.qualified` - Lead qualification completed
- `property.listed` - Property listed on MLS
- `property.sold` - Property sold
- `appointment.scheduled` - Property showing scheduled
- `appointment.completed` - Property showing completed
- `transaction.created` - New transaction created
- `transaction.closed` - Transaction closed
- `document.generated` - Real estate document generated
- `commission.earned` - Commission earned
- `market.analysis.completed` - Market analysis completed

**Webhook Payload Example:**
```json
{
  "eventType": "property.listed",
  "propertyId": "PROP_001",
  "agentId": "AGENT_001",
  "agencyId": "AGENCY_001",
  "data": {
    "propertyId": "PROP_001",
    "mlsNumber": "MLS123456",
    "listPrice": 450000,
    "status": "active"
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
    "code": "INVALID_PROPERTY_ID",
    "message": "Property ID not found in system",
    "details": "The property ID PROP_999 does not exist",
    "timestamp": "2025-01-10T16:30:00.000Z",
    "requestId": "REQ_123456789"
  }
}
```

### **Common Error Codes**
- `INVALID_API_KEY` - Invalid or missing API key
- `INVALID_PROPERTY_ID` - Property ID not found
- `INVALID_CLIENT_ID` - Client ID not found
- `INVALID_AGENT_ID` - Agent ID not found
- `MLS_COMPLIANCE_ERROR` - MLS compliance violation
- `FAIR_HOUSING_VIOLATION` - Fair Housing Act violation
- `DOCUMENT_GENERATION_FAILED` - Document generation failed
- `COMMISSION_CALCULATION_ERROR` - Commission calculation error
- `RATE_LIMIT_EXCEEDED` - Rate limit exceeded
- `INTERNAL_ERROR` - Internal server error

---

## ⚡ **Rate Limits**

### **API Rate Limits**
- **Standard Tier:** 1,000 requests per hour
- **Professional Tier:** 10,000 requests per hour
- **Enterprise Tier:** 100,000 requests per hour
- **Real Estate Emergency:** 1,000,000 requests per hour

### **Rate Limit Headers**
```http
X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9999
X-RateLimit-Reset: 1641234567
X-RateLimit-Retry-After: 3600
```

---

## 📞 **Support**

### **Real Estate Support Team**
- **Email:** real-estate-support@tetrixcorp.com
- **Phone:** +1 (555) 123-REAL
- **Hours:** 24/7 Real Estate Support

### **Compliance & MLS**
- **Email:** real-estate-compliance@tetrixcorp.com
- **Phone:** +1 (555) 123-MLS
- **Hours:** Business Hours (9 AM - 6 PM EST)

### **API Documentation**
- **Interactive Docs:** https://api.tetrixcorp.com/real-estate/docs
- **Postman Collection:** Available for download
- **SDK Libraries:** JavaScript, Python, Java, C#

---

*This API reference is part of the TETRIX Real Estate Platform. For additional support, contact our real estate integration team.*
