# 🧪 Compliant Call Flow Testing Guide
**Unit and Functional Tests for Compliant IVR Orchestration**

**Version:** 1.0  
**Date:** January 10, 2025  
**Status:** ✅ Complete Test Suite

---

## 📋 **Overview**

This document describes the comprehensive test suite for the compliant call flow orchestration system. The tests validate that the webhook handler correctly orchestrates compliance-aware IVR call flows using Telnyx TeXML commands.

---

## 🎯 **Test Coverage**

### **Unit Tests**
- ✅ CompliantIVRService orchestration logic
- ✅ Webhook orchestration step-by-step validation
- ✅ TeXML generation and validation
- ✅ Error handling and edge cases

### **Functional Tests**
- ✅ End-to-end compliant call flow
- ✅ Webhook handler integration
- ✅ Complete call flow scenarios
- ✅ Healthcare HIPAA compliance flow

---

## 📁 **Test Files**

### **1. Unit Tests**

#### **`tests/unit/compliantIVRService.test.ts`**
Tests the core `CompliantIVRService` orchestration logic.

**Test Cases:**
- ✅ Call initiation and audit logging
- ✅ Policy evaluation and action handling
- ✅ Authentication flow
- ✅ Disclosure playback with recording
- ✅ Escalation to agent
- ✅ Transcript redaction
- ✅ XML escaping

**Key Assertions:**
```typescript
// Verify audit logging
expect(auditEvidenceService.logEvent).toHaveBeenCalledWith(
  expect.objectContaining({
    eventType: 'call.initiated',
    tenantId: 'tenant_123',
    callId: 'call_123'
  })
);

// Verify TeXML generation
expect(response.texml).toContain('<Gather');
expect(response.texml).toContain('account number');
expect(response.nextStep).toBe('identity_verification');
```

#### **`tests/unit/webhookOrchestration.test.ts`**
Tests the step-by-step webhook orchestration.

**Test Cases:**
- ✅ Step 1: Call Initiated
  - Logs `call.initiated` event
  - Calls Policy Engine
  - Returns `gather_using_speak` TeXML
- ✅ Step 2: Identity Verification
  - Logs verification start
  - Handles verification success
  - Proceeds to consent
- ✅ Step 3: Consent Capture
  - Plays disclosure script
  - Uses `record_start` command
  - Records consent when user presses 1
  - Uses `record_stop` if needed
- ✅ Step 4: Core Task Execution
  - Redacts sensitive data
  - Logs each step
- ✅ Step 5: Human Escalation
  - Uses `bridge` command
  - Includes audit trail ID
  - Logs escalation

---

### **2. Functional Tests**

#### **`tests/functional/compliantCallFlow.test.ts`**
Tests complete end-to-end compliant call flows.

**Test Scenarios:**

1. **Complete Call Flow: Initiation → Authentication → Consent → Core Task**
   ```typescript
   // Step 1: Call Initiated
   // Step 2: Identity Verification
   // Step 3: Consent Capture
   // Step 4: Core Task Execution
   // Step 5: Audit Trail Integrity
   ```

2. **Consent Denied → Escalation**
   - User denies consent
   - System escalates to agent
   - Escalation is logged

3. **Max Retries → Escalation**
   - Authentication fails 3 times
   - System escalates
   - High priority escalation logged

4. **Data Redaction During Core Task**
   - Transcript contains PII/PHI/PCI
   - Data is redacted
   - Redaction is logged

5. **Audit Trail Integrity**
   - All events logged in sequence
   - Event hashes maintained
   - Chain integrity verified

6. **Healthcare HIPAA Compliance**
   - HIPAA-specific disclosure
   - PHI protection enforced
   - Compliance logging

#### **`tests/functional/webhookHandler.test.ts`**
Tests the webhook endpoint integration.

**Test Cases:**
- ✅ Call Initiated Webhook
  - Handles Telnyx webhook parameters
  - Returns authentication prompt
  - Determines tenant and industry
- ✅ Identity Verification Webhook
  - Processes DTMF input
  - Verifies identity
  - Logs verification result
- ✅ Consent Capture Webhook
  - Processes consent DTMF
  - Records consent
  - Returns next step TeXML
- ✅ Error Handling
  - Handles service errors
  - Returns error TeXML
  - Logs errors to audit trail
- ✅ TeXML Response Validation
  - Valid XML structure
  - Proper headers
  - Cache control headers

---

## 🧪 **Running Tests**

### **Run All Tests**
```bash
pnpm test
```

### **Run Unit Tests Only**
```bash
pnpm test:run tests/unit/compliantIVRService.test.ts
pnpm test:run tests/unit/webhookOrchestration.test.ts
```

### **Run Functional Tests Only**
```bash
pnpm test:run tests/functional/compliantCallFlow.test.ts
pnpm test:run tests/functional/webhookHandler.test.ts
```

### **Run with Coverage**
```bash
pnpm test:coverage
```

### **Run in Watch Mode**
```bash
pnpm test:watch
```

---

## 📊 **Test Scenarios**

### **Scenario 1: Standard Compliant Call Flow**

```
1. Call Initiated
   ├─ Log: call.initiated
   ├─ Evaluate Policy → authenticate
   └─ Return: gather_using_speak (account number prompt)

2. Identity Verification (DTMF: 1234567890)
   ├─ Log: identity.verification_started
   ├─ Verify account number
   ├─ Log: identity.verification_completed (success)
   └─ Evaluate Policy → play_disclosure

3. Consent Capture
   ├─ Log: disclosure.script_played
   ├─ Return: record_start + disclosure script + gather_using_speak
   └─ User presses 1

4. Consent Granted (DTMF: 1)
   ├─ Log: consent.granted
   ├─ Record consent in Consent Management Service
   ├─ Log: record_stop (if only consent recorded)
   └─ Proceed to main menu

5. Core Task Execution
   ├─ Execute business logic
   ├─ Redact sensitive data from transcript
   ├─ Log: data.redacted
   └─ Log: policy.action_taken (each step)
```

### **Scenario 2: Consent Denied → Escalation**

```
1-3. Same as Scenario 1

4. Consent Denied (DTMF: 2)
   ├─ Log: consent.denied
   └─ Evaluate Policy → escalate

5. Escalation
   ├─ Log: escalation.triggered
   ├─ Return: bridge command with audit_trail_id
   └─ Transfer to agent
```

### **Scenario 3: Max Retries → Escalation**

```
1. Call Initiated → Authentication Prompt

2-4. Identity Verification Failed (3 attempts)
   ├─ Log: identity.verification_failed (x3)
   └─ Evaluate Policy → escalate (max_retries_exceeded)

5. Escalation
   ├─ Log: escalation.triggered (priority: high)
   └─ Bridge to agent
```

---

## ✅ **Test Assertions**

### **Audit Logging Assertions**

```typescript
// Verify call initiation logged
expect(auditEvidenceService.logEvent).toHaveBeenCalledWith(
  expect.objectContaining({
    eventType: 'call.initiated',
    tenantId: 'tenant_123',
    callId: 'call_123'
  })
);

// Verify consent logged
expect(auditEvidenceService.logEvent).toHaveBeenCalledWith(
  expect.objectContaining({
    eventType: 'consent.granted',
    eventData: expect.objectContaining({
      granted: true
    })
  })
);
```

### **TeXML Assertions**

```typescript
// Verify authentication prompt
expect(response.texml).toContain('<Gather');
expect(response.texml).toContain('account number');
expect(response.texml).toContain('/api/ivr/call_123/verify');

// Verify recording command
expect(response.texml).toContain('<Record');
expect(response.texml).toContain('record-from-answer');

// Verify disclosure script
expect(response.texml).toContain('This call will be recorded');

// Verify escalation
expect(response.texml).toContain('<Dial');
expect(response.texml).toContain('representative');
```

### **Policy Engine Assertions**

```typescript
// Verify policy evaluation called
expect(policyEngineService.evaluatePolicy).toHaveBeenCalledWith({
  callId: 'call_123',
  tenantId: 'tenant_123',
  currentStep: 'initiated',
  callContext: expect.objectContaining({
    authenticated: false,
    consentGranted: false
  })
});
```

### **Consent Management Assertions**

```typescript
// Verify consent recorded
expect(consentManagementService.recordConsent).toHaveBeenCalledWith({
  customerId: 'customer_123',
  tenantId: 'tenant_123',
  channel: 'voice',
  consentType: 'call_recording',
  granted: true,
  auditTrailId: 'call_123'
});
```

---

## 🔍 **Mocking Strategy**

### **Mocked Services**

1. **Audit Evidence Service**
   ```typescript
   vi.mock('../../src/services/compliance/auditEvidenceService', () => ({
     auditEvidenceService: {
       logEvent: vi.fn().mockResolvedValue({ /* ... */ }),
       searchEvents: vi.fn().mockReturnValue([])
     }
   }));
   ```

2. **Policy Engine Service**
   ```typescript
   vi.mock('../../src/services/compliance/policyEngineService', () => ({
     policyEngineService: {
       evaluatePolicy: vi.fn(),
       getScript: vi.fn().mockReturnValue({ /* ... */ })
     }
   }));
   ```

3. **Consent Management Service**
   ```typescript
   vi.mock('../../src/services/compliance/consentManagementService', () => ({
     consentManagementService: {
       recordConsent: vi.fn().mockResolvedValue({ /* ... */ })
     }
   }));
   ```

---

## 🚨 **Error Scenarios**

### **Tested Error Cases**

1. **Policy Engine Error**
   - Policy evaluation fails
   - Error logged to audit trail
   - Error TeXML returned

2. **Missing Disclosure Script**
   - Script ID not found
   - Error thrown
   - Error logged

3. **Service Unavailable**
   - Compliance service unavailable
   - Error TeXML returned
   - Error logged

4. **Missing Required Parameters**
   - Missing CallControlId
   - Defaults used
   - Flow continues

---

## 📈 **Coverage Goals**

- **Unit Tests:** 90%+ coverage
- **Functional Tests:** All critical paths covered
- **Integration Tests:** End-to-end flows validated

---

## 🔄 **Continuous Integration**

Tests run automatically on:
- Pull requests
- Commits to main branch
- Pre-deployment checks

---

## 📝 **Test Maintenance**

### **Adding New Tests**

1. **Unit Test:** Add to `tests/unit/`
2. **Functional Test:** Add to `tests/functional/`
3. **Update Documentation:** Update this file

### **Test Naming Convention**

- Unit tests: `*.test.ts`
- Functional tests: `*.test.ts`
- Describe blocks: Feature/Component name
- It blocks: Should [expected behavior]

---

## ✅ **Test Checklist**

- [x] Call initiation logged
- [x] Policy evaluation called
- [x] Authentication prompt generated
- [x] Identity verification logged
- [x] Disclosure script played
- [x] Recording started
- [x] Consent recorded
- [x] Consent logged
- [x] Data redaction performed
- [x] Escalation handled
- [x] Audit trail maintained
- [x] Error handling tested
- [x] TeXML validation
- [x] HIPAA compliance tested

---

## 🎉 **Summary**

The test suite provides comprehensive coverage for:

✅ **Unit Tests** - Service orchestration logic  
✅ **Functional Tests** - End-to-end call flows  
✅ **Integration Tests** - Webhook handler  
✅ **Error Handling** - Edge cases and failures  
✅ **Compliance** - HIPAA, PCI-DSS, PII protection  

All tests pass and validate the compliant call flow orchestration system.

---

*For questions or issues, refer to the main compliance documentation: `COMPLIANCE_ENGINE_IMPLEMENTATION.md`*
