# TETRIX 2FA Authentication System Test Suite

This comprehensive test suite validates the 2FA authentication system including modal functionality, API endpoints, and complete authentication flows.

## 🧪 Test Structure

### Unit Tests
- **`2FAModal.test.ts`** - Tests for modal functionality, state management, and user interactions
- **`2FAAPI.test.ts`** - Tests for API endpoints (`/api/v2/2fa/initiate` and `/api/v2/2fa/verify`)

### Functional Tests
- **`2FAFlow.test.ts`** - End-to-end authentication flow testing with realistic user scenarios

### Integration Tests
- **`2FASystem.test.ts`** - Complete system integration testing including frontend-backend communication

## 🚀 Quick Start

### Prerequisites
```bash
# Install dependencies
npm install

# Install Vitest (if not already installed)
npm install -D vitest @vitest/ui @vitest/coverage-v8 jsdom
```

### Running Tests

#### All 2FA Tests
```bash
# Run all 2FA related tests
npm run test:2fa

# Or using the custom test runner
ts-node tests/run2FATests.ts
```

#### By Category
```bash
# Unit tests only
npm run test:unit
ts-node tests/run2FATests.ts unit

# Functional tests only
npm run test:functional
ts-node tests/run2FATests.ts functional

# Integration tests only
npm run test:integration
ts-node tests/run2FATests.ts integration
```

#### Individual Test Files
```bash
# Modal functionality
vitest run tests/unit/2FAModal.test.ts

# API endpoints
vitest run tests/unit/2FAAPI.test.ts

# Authentication flows
vitest run tests/functional/2FAFlow.test.ts

# System integration
vitest run tests/integration/2FASystem.test.ts
```

#### Watch Mode
```bash
# Watch all tests
npm run test:watch

# Watch specific tests
vitest tests/unit/2FAModal.test.ts --watch
```

#### Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# Coverage with UI
vitest --ui --coverage
```

## 📋 Test Coverage

### Modal Functionality Tests
- ✅ Modal initialization and state management
- ✅ Phone number validation and formatting
- ✅ Verification code input handling
- ✅ Error message display and hiding
- ✅ Loading state management
- ✅ Step progression (phone → code → success)
- ✅ Modal closing and state reset

### API Endpoint Tests
- ✅ Phone number validation
- ✅ Method validation (SMS, voice, WhatsApp)
- ✅ Successful verification initiation
- ✅ Successful code verification
- ✅ Error handling for invalid inputs
- ✅ Error handling for service failures
- ✅ Response format validation
- ✅ Authentication token generation

### Authentication Flow Tests
- ✅ Complete SMS authentication flow
- ✅ Complete voice call authentication flow
- ✅ Authentication failure and retry scenarios
- ✅ Network error handling
- ✅ API error handling with user feedback
- ✅ Input validation at each step
- ✅ Loading states during API calls

### Integration Tests
- ✅ End-to-end authentication with real API calls
- ✅ Frontend-backend communication
- ✅ Security features (user agent, IP tracking)
- ✅ Concurrent request handling
- ✅ Performance and timeout scenarios
- ✅ Error propagation and handling

## 🔧 Test Configuration

### Environment Variables
The tests use the following environment variables (set in `tests/setup.ts`):
```typescript
NODE_ENV=test
***REMOVED***=KEY_mock_telnyx
TELNYX_PROFILE_ID=test-profile-id
MAILGUN_API_KEY=key_mock_mailgun
MAILGUN_DOMAIN=mg.test.com
```

### Mock Services
- **Enterprise2FAService** - Mocked for consistent testing
- **Stripe** - Mocked for payment-related tests
- **NotificationService** - Mocked for email/SMS tests
- **eSIMIntegrationService** - Mocked for eSIM ordering tests

## 📊 Test Results

### Expected Coverage
- **Lines**: 80%+
- **Functions**: 80%+
- **Branches**: 80%+
- **Statements**: 80%+

### Test Categories
- **Unit Tests**: 25+ test cases
- **Functional Tests**: 15+ test cases
- **Integration Tests**: 10+ test cases
- **Total**: 50+ test cases

## 🐛 Debugging Tests

### Verbose Output
```bash
# Run with verbose output
vitest run --reporter=verbose

# Run specific test with debug info
vitest run tests/unit/2FAModal.test.ts --reporter=verbose
```

### Debug Mode
```bash
# Run in debug mode
node --inspect-brk node_modules/.bin/vitest run tests/unit/2FAModal.test.ts
```

### Test UI
```bash
# Open test UI for interactive debugging
npm run test:ui
```

## 🔍 Test Scenarios

### Happy Path Scenarios
1. **SMS Authentication**
   - Enter valid phone number
   - Select SMS method
   - Receive verification code
   - Enter correct code
   - Successfully authenticate

2. **Voice Call Authentication**
   - Enter valid phone number
   - Select voice method
   - Receive voice call
   - Enter correct code
   - Successfully authenticate

### Error Scenarios
1. **Invalid Phone Number**
   - Empty phone number
   - Too short phone number
   - Invalid format

2. **Invalid Verification Code**
   - Empty code
   - Wrong code
   - Expired code

3. **Network Errors**
   - API timeout
   - Network failure
   - Service unavailable

4. **API Errors**
   - Rate limiting
   - Invalid credentials
   - Service errors

### Edge Cases
1. **Concurrent Requests**
   - Multiple simultaneous authentications
   - Rate limiting handling

2. **Session Management**
   - Session timeout
   - Token expiration
   - State persistence

3. **Security**
   - IP address tracking
   - User agent validation
   - Fraud detection

## 📝 Writing New Tests

### Unit Test Template
```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  it('should handle valid input', () => {
    // Arrange
    // Act
    // Assert
  });

  it('should handle error cases', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

### Functional Test Template
```typescript
describe('Complete Flow', () => {
  it('should complete full authentication flow', async () => {
    // Step 1: Setup
    // Step 2: Execute flow
    // Step 3: Verify results
  });
});
```

## 🚨 Troubleshooting

### Common Issues

1. **Tests not running**
   - Check if Vitest is installed: `npm list vitest`
   - Verify test files are in correct location
   - Check TypeScript configuration

2. **Mock errors**
   - Ensure mocks are properly configured in `setup.ts`
   - Check mock implementations match actual service interfaces

3. **Environment issues**
   - Verify environment variables are set
   - Check Node.js version compatibility

4. **Coverage issues**
   - Ensure all code paths are tested
   - Check coverage thresholds in configuration

### Getting Help
- Check test output for specific error messages
- Use `--reporter=verbose` for detailed output
- Review mock configurations in `setup.ts`
- Check API endpoint implementations

## 📈 Continuous Integration

### GitHub Actions Example
```yaml
name: 2FA Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:2fa
      - run: npm run test:coverage
```

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:2fa"
    }
  }
}
```

## 🎯 Best Practices

1. **Test Isolation** - Each test should be independent
2. **Clear Naming** - Use descriptive test names
3. **Arrange-Act-Assert** - Structure tests clearly
4. **Mock External Dependencies** - Don't rely on external services
5. **Test Edge Cases** - Cover error scenarios and edge cases
6. **Maintain Test Data** - Use consistent test data
7. **Regular Updates** - Keep tests in sync with code changes

---

**Note**: This test suite is designed to ensure the 2FA authentication system works reliably across all scenarios. Regular test execution helps maintain code quality and prevents regressions.
