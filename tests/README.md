# TETRIX Cross-Platform Authentication Tests

This directory contains comprehensive tests for the TETRIX cross-platform authentication system.

## 📁 Test Structure

```
tests/
├── unit/                    # Unit tests for individual components
│   ├── 2FAModal.test.tsx
│   ├── CodeAcademyModal.test.tsx
│   └── EnvironmentConfig.test.ts
├── functional/              # Functional tests for user flows
│   ├── CodeAcademyAuthFlow.test.tsx
│   └── JoromiAuthFlow.test.tsx
├── integration/             # Integration tests for cross-platform auth
│   ├── CrossPlatformAuth.test.tsx
│   └── AuthBridge.test.tsx
├── mocks/                   # Mock data and utilities
│   └── api-mocks.ts
├── setup/                   # Test setup and configuration
│   ├── jest.setup.js
│   ├── test-utils.ts
│   └── test-environment.ts
└── README.md               # This file
```

## 🧪 Test Types

### Unit Tests
- **Purpose**: Test individual components in isolation
- **Coverage**: Component rendering, event handling, state management
- **Files**: `tests/unit/*.test.tsx`

### Functional Tests
- **Purpose**: Test complete user flows and interactions
- **Coverage**: End-to-end user journeys, authentication flows
- **Files**: `tests/functional/*.test.tsx`

### Integration Tests
- **Purpose**: Test cross-platform authentication integration
- **Coverage**: Platform switching, token sharing, error handling
- **Files**: `tests/integration/*.test.tsx`

## 🚀 Running Tests

### All Tests
```bash
npm run test
```

### By Type
```bash
# Unit tests only
npm run test:unit

# Functional tests only
npm run test:functional

# Integration tests only
npm run test:integration
```

### With Coverage
```bash
npm run test:coverage
```

### Watch Mode
```bash
npm run test:watch
```

### Debug Mode
```bash
npm run test:debug
```

## 📊 Test Coverage

The test suite aims for:
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## 🔧 Test Configuration

### Jest Configuration
- **Preset**: `ts-jest`
- **Environment**: `jsdom`
- **Timeout**: 10 seconds
- **Setup**: `tests/setup/jest.setup.js`

### Environment Variables
```bash
NODE_ENV=test
TETRIX_API_URL=http://localhost:4321
JOROMI_URL=http://localhost:3000
CODE_ACADEMY_URL=http://localhost:3001
```

## 🎯 Test Scenarios

### Authentication Flows
1. **Authenticated User**: Skip 2FA, direct redirect
2. **Unauthenticated User**: Complete 2FA flow
3. **Error Handling**: Network errors, invalid codes
4. **Retry Logic**: Multiple attempts, error recovery

### Cross-Platform Integration
1. **Platform Switching**: JoRoMi ↔ Code Academy
2. **Token Sharing**: Unified authentication state
3. **Environment Detection**: Development vs Production
4. **Error Propagation**: Consistent error handling

### Component Testing
1. **2FA Modal**: Phone input, code verification
2. **Code Academy Modal**: Authentication integration
3. **Environment Config**: URL resolution, environment detection
4. **Auth Bridges**: Cross-platform token management

## 🛠️ Mock Data

### API Responses
- `mock2FAInitiateResponse`: Successful 2FA initiation
- `mock2FAVerifyResponse`: Successful code verification
- `mock2FAErrorResponse`: Error responses

### User Data
- `mockUserData`: Valid user information
- `mockAuthToken`: Authentication token
- `mockPhoneNumber`: Test phone number
- `mockVerificationCode`: Test verification code

### Environment Configs
- `mockEnvironmentConfigs`: Development, staging, production
- `mockPlatforms`: JoRoMi, Code Academy, TETRIX
- `mockErrorMessages`: Standardized error messages

## 🔍 Debugging Tests

### Common Issues
1. **Async Operations**: Use `waitFor()` for async updates
2. **Mock Cleanup**: Clear mocks between tests
3. **State Management**: Reset authentication state
4. **Environment Variables**: Ensure test environment is set

### Debug Commands
```bash
# Run specific test file
npm test -- 2FAModal.test.tsx

# Run tests with verbose output
npm run test:verbose

# Run tests in debug mode
npm run test:debug

# Run tests with coverage
npm run test:coverage
```

## 📈 Continuous Integration

Tests run automatically on:
- **Push** to main, dev, staging branches
- **Pull Requests** to main, dev branches
- **Multiple Node.js versions** (18.x, 20.x)

### CI Pipeline
1. Install dependencies
2. Run unit tests
3. Run functional tests
4. Run integration tests
5. Generate coverage report
6. Upload to Codecov

## 🎉 Test Results

### Success Criteria
- All tests pass
- Coverage thresholds met
- No console errors
- No memory leaks

### Coverage Reports
- **HTML**: `coverage/index.html`
- **LCOV**: `coverage/lcov.info`
- **Text**: Console output

## 📝 Writing New Tests

### Test Structure
```typescript
describe('Component Name', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do something', () => {
    // Test implementation
  });
});
```

### Best Practices
1. **Arrange-Act-Assert**: Clear test structure
2. **Descriptive Names**: What, when, expected result
3. **Single Responsibility**: One test, one assertion
4. **Mock External Dependencies**: Isolate components
5. **Clean Up**: Reset state between tests

### Test Utilities
- `render()`: Render components
- `fireEvent`: Simulate user interactions
- `waitFor()`: Wait for async operations
- `screen`: Query DOM elements
- `mockFetch()`: Mock API calls
- `setupAuthenticatedState()`: Set auth state