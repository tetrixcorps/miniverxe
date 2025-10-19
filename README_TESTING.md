# 🧪 Authentication System Test Suite

This document provides comprehensive testing documentation for the TETRIX authentication system components.

## 📋 Test Overview

The test suite covers all major components of the authentication system:

- **2FA Modal Component** - User interface for 2FA verification
- **Industry Authentication** - Industry-specific role-based authentication
- **Enterprise 2FA Service** - Backend service for 2FA operations
- **API Endpoints** - REST API for 2FA initiation and verification
- **Integration Tests** - End-to-end authentication flows

## 🚀 Running Tests

### Prerequisites

```bash
npm install
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests once (CI mode)
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test suites
npm run test:auth        # Authentication components
npm run test:services    # Service layer tests
npm run test:api         # API endpoint tests
npm run test:integration # Integration tests
```

## 📁 Test Structure

```
src/
├── components/auth/__tests__/
│   ├── 2FAModal.test.ts           # 2FA Modal component tests
│   ├── IndustryAuth.test.ts       # Industry auth component tests
│   └── auth-integration.test.ts   # Integration tests
├── services/__tests__/
│   └── enterprise2FAService.test.ts # Service layer tests
├── pages/api/v2/2fa/__tests__/
│   └── api-endpoints.test.ts      # API endpoint tests
└── test/
    └── setup.ts                   # Test configuration
```

## 🧪 Test Categories

### 1. Unit Tests

#### 2FA Modal Component (`2FAModal.test.ts`)
- **Phone Number Validation**: Tests various phone number formats
- **2FA Initiation**: Tests SMS/voice verification initiation
- **Code Verification**: Tests 6-digit code validation
- **Error Handling**: Tests error scenarios and user feedback
- **Resend Functionality**: Tests code resend with rate limiting
- **Step Management**: Tests UI state transitions
- **Loading States**: Tests loading indicators

#### Industry Authentication (`IndustryAuth.test.ts`)
- **Industry Selection**: Tests role population based on industry
- **Form Validation**: Tests required field validation
- **2FA Integration**: Tests 2FA flow integration
- **Authentication Flow**: Tests complete auth process
- **Dashboard Redirection**: Tests proper URL generation
- **Modal Management**: Tests modal open/close functionality
- **Session Management**: Tests session ID generation and IP detection

#### Enterprise 2FA Service (`enterprise2FAService.test.ts`)
- **Verification Initiation**: Tests Telnyx API integration
- **Code Verification**: Tests OTP verification process
- **Fraud Detection**: Tests risk assessment algorithms
- **Rate Limiting**: Tests attempt limiting mechanisms
- **Audit Logging**: Tests security event logging
- **Error Handling**: Tests service error scenarios
- **Phone Number Formatting**: Tests consistent formatting

#### API Endpoints (`api-endpoints.test.ts`)
- **POST /initiate**: Tests 2FA initiation endpoint
- **POST /verify**: Tests code verification endpoint
- **Request Validation**: Tests input validation
- **Error Responses**: Tests error handling
- **Response Formatting**: Tests consistent response structure
- **Body Parsing**: Tests request body parsing

### 2. Integration Tests

#### Authentication Flow (`auth-integration.test.ts`)
- **Complete Industry Auth**: Tests full industry authentication flow
- **2FA Modal Integration**: Tests 2FA modal functionality
- **Cross-Component Communication**: Tests component interactions
- **Error Recovery**: Tests retry mechanisms
- **Security Validation**: Tests input sanitization
- **State Management**: Tests authentication state handling

## 🔧 Test Configuration

### Vitest Configuration (`vitest.config.ts`)

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});
```

### Test Setup (`src/test/setup.ts`)

The test setup file provides:
- **DOM Mocking**: Mock DOM elements and methods
- **Fetch Mocking**: Mock HTTP requests
- **LocalStorage Mocking**: Mock browser storage
- **Console Mocking**: Reduce test noise
- **Global Mocks**: Mock window, navigator, and other globals

## 📊 Coverage Requirements

The test suite maintains high coverage standards:

- **Branches**: 80% minimum
- **Functions**: 80% minimum  
- **Lines**: 80% minimum
- **Statements**: 80% minimum

## 🎯 Test Scenarios

### Happy Path Scenarios

1. **Successful Industry Authentication**
   - User selects industry and role
   - Enters organization name
   - Provides valid phone number
   - Receives and enters verification code
   - Gets redirected to appropriate dashboard

2. **Successful 2FA Verification**
   - User enters valid phone number
   - Receives SMS with verification code
   - Enters correct 6-digit code
   - Authentication succeeds with token

### Error Scenarios

1. **Invalid Phone Numbers**
   - Malformed phone numbers
   - Missing country codes
   - Invalid characters

2. **Verification Failures**
   - Invalid verification codes
   - Expired codes
   - Maximum attempts exceeded

3. **Network Errors**
   - API unavailability
   - Timeout errors
   - Connection failures

4. **Security Violations**
   - High fraud risk detection
   - Rate limiting exceeded
   - Suspicious patterns

## 🔍 Mocking Strategy

### API Mocking
```typescript
// Mock successful API response
mockFetch.mockResolvedValueOnce({
  ok: true,
  json: () => Promise.resolve({
    success: true,
    verificationId: 'ver_abc123'
  })
});
```

### DOM Mocking
```typescript
// Mock DOM elements
const mockElement = {
  value: 'test',
  classList: { add: vi.fn(), remove: vi.fn() },
  addEventListener: vi.fn()
};
```

### Service Mocking
```typescript
// Mock service methods
const mockService = {
  initiateVerification: vi.fn(),
  verifyCode: vi.fn()
};
```

## 🚨 Common Test Patterns

### Testing Async Operations
```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

### Testing Error Handling
```typescript
it('should handle errors gracefully', async () => {
  mockService.method.mockRejectedValue(new Error('Test error'));
  
  await expect(operation()).rejects.toThrow('Test error');
});
```

### Testing DOM Interactions
```typescript
it('should update DOM elements', () => {
  const element = document.getElementById('test');
  element.value = 'new value';
  
  expect(element.value).toBe('new value');
});
```

## 📈 Performance Testing

The test suite includes performance considerations:

- **Mock Timeouts**: Tests handle async operations efficiently
- **Memory Management**: Tests clean up after themselves
- **Parallel Execution**: Tests run in parallel when possible

## 🔒 Security Testing

Security-focused test scenarios:

- **Input Validation**: Tests malicious input handling
- **Rate Limiting**: Tests abuse prevention
- **Fraud Detection**: Tests risk assessment
- **Token Security**: Tests authentication token handling

## 📝 Best Practices

1. **Test Isolation**: Each test is independent
2. **Clear Naming**: Test names describe the scenario
3. **Arrange-Act-Assert**: Tests follow AAA pattern
4. **Mock External Dependencies**: Tests don't rely on external services
5. **Cover Edge Cases**: Tests cover error scenarios
6. **Maintainable**: Tests are easy to understand and modify

## 🐛 Debugging Tests

### Running Specific Tests
```bash
# Run specific test file
npm test 2FAModal.test.ts

# Run tests matching pattern
npm test -- --grep "phone number validation"

# Run tests in specific directory
npm test src/components/auth/__tests__/
```

### Debug Mode
```bash
# Run tests in debug mode
npm test -- --inspect-brk

# Run tests with verbose output
npm test -- --reporter=verbose
```

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)
- [JSDOM Documentation](https://github.com/jsdom/jsdom)
- [Mock Service Worker](https://mswjs.io/) (for API mocking)

## 🤝 Contributing

When adding new tests:

1. Follow existing naming conventions
2. Include both happy path and error scenarios
3. Mock external dependencies
4. Maintain high coverage
5. Update this documentation

## 📞 Support

For test-related issues:

1. Check test output for specific error messages
2. Verify mock configurations
3. Ensure all dependencies are installed
4. Review test setup configuration
