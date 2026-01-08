# 🧪 Test Run Instructions

## Running Compliant Call Flow Tests

The test suite has been created and is ready to run. Here are the commands to execute the tests:

### **Quick Run - All Tests**

```bash
# Run all compliance tests
pnpm test tests/unit/compliantIVRService.test.ts tests/unit/webhookOrchestration.test.ts tests/functional/compliantCallFlow.test.ts tests/functional/webhookHandler.test.ts

# Or use the test script
bash run-compliance-tests.sh
```

### **Individual Test Files**

```bash
# Unit Tests
pnpm test:run tests/unit/compliantIVRService.test.ts
pnpm test:run tests/unit/webhookOrchestration.test.ts

# Functional Tests
pnpm test:run tests/functional/compliantCallFlow.test.ts
pnpm test:run tests/functional/webhookHandler.test.ts
```

### **With Coverage**

```bash
pnpm test:coverage tests/unit/compliantIVRService.test.ts
```

### **Watch Mode**

```bash
pnpm test:watch tests/unit/compliantIVRService.test.ts
```

---

## Test Files Created

✅ **Unit Tests:**
- `tests/unit/compliantIVRService.test.ts` - Service orchestration tests
- `tests/unit/webhookOrchestration.test.ts` - Step-by-step orchestration tests

✅ **Functional Tests:**
- `tests/functional/compliantCallFlow.test.ts` - End-to-end call flow tests
- `tests/functional/webhookHandler.test.ts` - Webhook handler integration tests

---

## Expected Test Results

### **Unit Tests (compliantIVRService.test.ts)**
- ✅ Call initiation and audit logging
- ✅ Policy evaluation and action handling
- ✅ Authentication flow
- ✅ Disclosure playback with recording
- ✅ Escalation to agent
- ✅ Transcript redaction
- ✅ XML escaping

### **Unit Tests (webhookOrchestration.test.ts)**
- ✅ Step 1: Call Initiated
- ✅ Step 2: Identity Verification
- ✅ Step 3: Consent Capture
- ✅ Step 4: Core Task Execution
- ✅ Step 5: Human Escalation

### **Functional Tests (compliantCallFlow.test.ts)**
- ✅ Complete end-to-end call flow
- ✅ Consent denied → escalation
- ✅ Max retries → escalation
- ✅ Data redaction during core task
- ✅ Audit trail integrity
- ✅ Healthcare HIPAA compliance

### **Functional Tests (webhookHandler.test.ts)**
- ✅ Call initiated webhook handling
- ✅ Identity verification webhook
- ✅ Consent capture webhook
- ✅ Error handling
- ✅ TeXML response validation

---

## Troubleshooting

### **If tests fail to run:**

1. **Check dependencies:**
   ```bash
   pnpm install
   ```

2. **Verify vitest is installed:**
   ```bash
   pnpm list vitest
   ```

3. **Check test file paths:**
   ```bash
   ls -la tests/unit/compliantIVRService.test.ts
   ls -la tests/functional/compliantCallFlow.test.ts
   ```

4. **Run with verbose output:**
   ```bash
   pnpm exec vitest run --reporter=verbose tests/unit/compliantIVRService.test.ts
   ```

5. **Check for TypeScript errors:**
   ```bash
   pnpm exec tsc --noEmit tests/unit/compliantIVRService.test.ts
   ```

---

## Test Coverage

The tests cover all 5 steps of the compliant call flow:

1. ✅ **Call Initiated** - Logs event, calls Policy Engine, returns authentication prompt
2. ✅ **Identity Verification** - Processes DTMF, verifies identity, logs result
3. ✅ **Consent Capture** - Plays disclosure, records consent, logs to Consent Management Service
4. ✅ **Core Task Execution** - Redacts data, logs each step
5. ✅ **Human Escalation** - Uses bridge command with audit trail ID

---

## Notes

- All tests use mocked dependencies (audit service, policy engine, consent service)
- Tests validate TeXML generation and structure
- Tests verify audit logging at each step
- Tests check error handling scenarios

---

*For detailed test documentation, see: `COMPLIANT_CALL_FLOW_TESTING.md`*
