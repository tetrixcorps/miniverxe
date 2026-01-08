# Call Center Testing Guide

## Test Suite Overview

Comprehensive test coverage for the Call Center implementation, including unit tests for services and functional tests for API endpoints.

## Test Files

### Unit Tests

1. **`tests/unit/callCenterService.test.ts`**
   - Tests CallCenterService core functionality
   - Covers TeXML generation, call management, agent routing
   - Tests configuration management and edge cases

2. **`tests/unit/agentManagementService.test.ts`**
   - Tests AgentManagementService functionality
   - Covers agent registration, status tracking, metrics
   - Tests heartbeat management and offline detection

### Functional Tests

3. **`tests/functional/callCenterAPI.test.ts`**
   - Tests all Call Center API endpoints
   - Covers webhook handlers (inbound, dial, voicemail, events)
   - Tests agent management endpoints
   - Verifies integration with compliance services

## Running Tests

### Run All Call Center Tests
```bash
pnpm test tests/unit/callCenterService.test.ts tests/unit/agentManagementService.test.ts tests/functional/callCenterAPI.test.ts
```

### Run Unit Tests Only
```bash
pnpm test:run tests/unit/callCenterService.test.ts
pnpm test:run tests/unit/agentManagementService.test.ts
```

### Run Functional Tests Only
```bash
pnpm test:run tests/functional/callCenterAPI.test.ts
```

### Run with Coverage
```bash
pnpm test:coverage tests/unit/callCenterService.test.ts tests/unit/agentManagementService.test.ts tests/functional/callCenterAPI.test.ts
```

## Test Coverage

### CallCenterService Tests

#### Initialization
- ✅ Service initialization with configuration
- ✅ Agent status tracking initialization

#### TeXML Generation
- ✅ Inbound greeting TeXML
- ✅ Dial agents TeXML with all available agents
- ✅ Busy message when no agents available
- ✅ Retry dial TeXML
- ✅ Voicemail TeXML
- ✅ Answered call TeXML
- ✅ Voicemail disabled handling

#### Agent Management
- ✅ Get available agents
- ✅ Filter busy agents
- ✅ Update agent status
- ✅ Add new agent
- ✅ Remove agent

#### Call Management
- ✅ Create new call
- ✅ Update call status
- ✅ Set end time on completion
- ✅ Get call by ID
- ✅ Get active calls
- ✅ Handle non-existent calls

#### Configuration Management
- ✅ Update configuration
- ✅ Reinitialize agents on update

#### Edge Cases
- ✅ Empty agent list
- ✅ Invalid call ID
- ✅ Invalid agent ID

### AgentManagementService Tests

#### Agent Registration
- ✅ Register new agent
- ✅ Initialize metrics for new agent
- ✅ Get registered agent
- ✅ Handle non-existent agent

#### Agent Status Management
- ✅ Set agent status
- ✅ Update last seen timestamp
- ✅ Get agents by status
- ✅ Get all agents
- ✅ Get available agents

#### Heartbeat Management
- ✅ Update heartbeat
- ✅ Set status to available from offline
- ✅ Preserve status for available agents
- ✅ Check if agent is online
- ✅ Handle agents with no heartbeat
- ✅ Mark offline agents

#### Call Metrics
- ✅ Update metrics for answered call
- ✅ Update metrics for missed call
- ✅ Calculate rolling average
- ✅ Handle multiple calls

#### Agent Unregistration
- ✅ Unregister agent
- ✅ Handle non-existent agent

### Call Center API Tests

#### Inbound Call Handler
- ✅ Handle inbound call and return greeting TeXML
- ✅ Create call record on inbound
- ✅ Log audit event on inbound call
- ✅ Handle errors gracefully

#### Dial Agents Handler
- ✅ Generate dial agents TeXML
- ✅ Handle missing callId

#### Retry Dial Handler
- ✅ Generate retry dial TeXML
- ✅ Redirect to voicemail when max attempts reached

#### Voicemail Handler
- ✅ Generate voicemail TeXML

#### Voicemail Callback Handler
- ✅ Handle voicemail callback
- ✅ Update call status and voicemail URL

#### Outbound Event Handler
- ✅ Handle call.answered event
- ✅ Handle call.hangup event
- ✅ Update agent status on call end

#### Agent Management Endpoints
- ✅ Register new agent
- ✅ List agents
- ✅ Handle agent heartbeat

## Mocking

### Dependencies Mocked

- `auditEvidenceService` - Mocked for compliance logging
- `getEnvironmentConfig` - Mocked for environment configuration

### Test Setup

Each test file includes:
- Proper mock setup in `beforeEach`
- Service initialization
- Test data preparation
- Cleanup between tests

## Integration Testing

### Manual Testing Checklist

1. **Setup**
   - [ ] Configure environment variables
   - [ ] Register agents via API
   - [ ] Verify agent status

2. **Call Flow**
   - [ ] Make inbound call to call center number
   - [ ] Verify greeting plays
   - [ ] Verify agents are dialed
   - [ ] Answer call from agent
   - [ ] Verify call connects
   - [ ] End call and verify cleanup

3. **Voicemail**
   - [ ] Let call go to voicemail
   - [ ] Leave voicemail message
   - [ ] Verify voicemail callback received
   - [ ] Verify recording URL stored

4. **Agent Management**
   - [ ] Register new agent
   - [ ] Update agent status
   - [ ] Send heartbeat
   - [ ] Verify agent appears in list
   - [ ] Unregister agent

5. **Compliance**
   - [ ] Verify audit logs created
   - [ ] Check event types logged
   - [ ] Verify call data in audit trail

## Troubleshooting Tests

### Common Issues

1. **Singleton Pattern**
   - Tests use `initializeCallCenterService` before accessing service
   - Each test initializes fresh service instance

2. **Mock URL Objects**
   - Tests manually set `searchParams` and `origin` properties
   - Handles jsdom environment limitations

3. **FormData Handling**
   - Uses native `FormData` for POST requests
   - Properly extracts form data in handlers

4. **Service Dependencies**
   - All dependencies properly mocked
   - Services initialized in `beforeEach`

## Continuous Integration

Tests should be run as part of CI/CD pipeline:

```yaml
- name: Run Call Center Tests
  run: |
    pnpm test:run tests/unit/callCenterService.test.ts
    pnpm test:run tests/unit/agentManagementService.test.ts
    pnpm test:run tests/functional/callCenterAPI.test.ts
```

## Test Maintenance

### Adding New Tests

1. Follow existing test patterns
2. Mock all external dependencies
3. Use descriptive test names
4. Include edge cases
5. Test error handling

### Updating Tests

When updating service code:
1. Update corresponding tests
2. Verify all tests pass
3. Add tests for new features
4. Update this documentation

## Performance Testing

For load testing (separate from unit/functional tests):

1. **Concurrent Calls**
   - Test multiple simultaneous calls
   - Verify agent distribution
   - Check for race conditions

2. **Agent Capacity**
   - Test with many agents
   - Verify dial performance
   - Check memory usage

3. **Call Volume**
   - Test high call volume
   - Verify call tracking performance
   - Check database performance

## References

- [Vitest Documentation](https://vitest.dev/)
- [Call Center Setup Guide](./call-center-setup.md)
- [Call Center Implementation](./call-center-implementation.md)
