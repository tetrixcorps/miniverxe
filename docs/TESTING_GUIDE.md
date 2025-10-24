# TETRIX Code Academy - Testing Guide

## 🧪 Overview

This guide covers comprehensive testing strategies for the TETRIX Code Academy platform, including unit tests, integration tests, and end-to-end tests for both backend and frontend components.

## 📋 Testing Strategy

### Test Pyramid

```
    ┌─────────────────┐
    │   E2E Tests     │  ← Few, high-level user journeys
    │   (Playwright)  │
    ├─────────────────┤
    │ Integration     │  ← Medium, API and service interactions
    │ Tests (Jest)    │
    ├─────────────────┤
    │   Unit Tests    │  ← Many, individual functions/components
    │ (Jest/Vitest)   │
    └─────────────────┘
```

### Test Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: 70%+ coverage
- **E2E Tests**: Critical user journeys
- **Overall**: 75%+ coverage

## 🚀 Quick Start

### Prerequisites

```bash
# Install dependencies
npm install

# Setup test environment
./run-tests.sh --setup

# Run all tests
./run-tests.sh
```

### Test Commands

```bash
# Run all tests
./run-tests.sh

# Run specific test types
./run-tests.sh unit
./run-tests.sh integration
./run-tests.sh e2e
./run-tests.sh coverage

# Run backend only
./run-tests.sh --backend unit

# Run frontend only
./run-tests.sh --frontend e2e

# Run with UI
./run-tests.sh --frontend ui
```

## 🔧 Backend Testing

### Test Structure

```
code-academy-backend/
├── src/
│   ├── __tests__/
│   │   ├── setup.ts                 # Test setup and mocks
│   │   ├── globalSetup.ts           # Global test setup
│   │   ├── globalTeardown.ts        # Global test cleanup
│   │   ├── routes/
│   │   │   └── auth.test.ts         # Authentication route tests
│   │   ├── services/
│   │   │   └── aiService.test.ts    # AI service tests
│   │   └── integration/
│   │       └── api.test.ts          # API integration tests
│   └── ...
├── jest.config.js                   # Jest configuration
└── package.json
```

### Unit Tests

**Purpose**: Test individual functions, classes, and modules in isolation.

**Examples**:
- Authentication service methods
- AI service functions
- Database operations
- Utility functions

**Running**:
```bash
cd code-academy-backend
npm run test:unit
```

### Integration Tests

**Purpose**: Test API endpoints and service interactions.

**Examples**:
- Complete authentication flow
- Course management operations
- Database transactions
- External API integrations

**Running**:
```bash
cd code-academy-backend
npm run test:integration
```

### Test Configuration

**Jest Configuration** (`jest.config.js`):
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  globalSetup: '<rootDir>/src/__tests__/globalSetup.ts',
  globalTeardown: '<rootDir>/src/__tests__/globalTeardown.ts',
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 10000,
}
```

### Mocking Strategy

**External Services**:
- OpenAI API
- Deepgram API
- Database connections
- Email services

**Example Mock**:
```typescript
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: { content: 'Mocked AI response' }
          }]
        })
      }
    }
  }))
}))
```

## 🎨 Frontend Testing

### Test Structure

```
code-academy-frontend/
├── src/
│   ├── __tests__/
│   │   ├── setup.ts                 # Test setup and mocks
│   │   ├── components/
│   │   │   ├── Layout.test.tsx      # Layout component tests
│   │   │   └── ProtectedRoute.test.tsx
│   │   └── services/
│   │       └── authService.test.ts  # Auth service tests
│   └── ...
├── e2e/
│   ├── auth.spec.ts                 # Authentication E2E tests
│   └── courses.spec.ts              # Course management E2E tests
├── vitest.config.ts                 # Vitest configuration
└── package.json
```

### Unit Tests

**Purpose**: Test React components and services in isolation.

**Examples**:
- Component rendering
- User interactions
- State management
- Service functions

**Running**:
```bash
cd code-academy-frontend
npm run test:run
```

### E2E Tests

**Purpose**: Test complete user journeys in a real browser.

**Examples**:
- User registration and login
- Course enrollment
- AI assistance interaction
- Real-time collaboration

**Running**:
```bash
cd code-academy-frontend
npm run test:e2e
```

### Test Configuration

**Vitest Configuration** (`vitest.config.ts`):
```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
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
})
```

### Mocking Strategy

**External Dependencies**:
- React Router
- React Query
- Socket.io
- Axios
- Framer Motion

**Example Mock**:
```typescript
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/', search: '', hash: '', state: null })
  }
})
```

## 📊 Test Coverage

### Backend Coverage

**Target**: 80%+ coverage

**Key Areas**:
- Authentication routes: 90%+
- AI services: 85%+
- Database operations: 80%+
- Error handling: 90%+

**Running Coverage**:
```bash
cd code-academy-backend
npm run test:coverage
```

### Frontend Coverage

**Target**: 80%+ coverage

**Key Areas**:
- Components: 85%+
- Services: 90%+
- Hooks: 80%+
- Utils: 95%+

**Running Coverage**:
```bash
cd code-academy-frontend
npm run test:coverage
```

## 🔄 CI/CD Integration

### GitHub Actions

**Test Pipeline**:
```yaml
name: Tests
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
      - run: ./run-tests.sh --setup
      - run: ./run-tests.sh ci
      - uses: codecov/codecov-action@v3
```

### Test Reports

**Coverage Reports**:
- HTML: `coverage/index.html`
- LCOV: `coverage/lcov.info`
- JSON: `coverage/coverage-final.json`

**Test Results**:
- JUnit: `test-results/junit.xml`
- JSON: `test-results/results.json`

## 🐛 Debugging Tests

### Backend Debugging

**Debug Unit Tests**:
```bash
cd code-academy-backend
npm run test:watch -- --verbose
```

**Debug Integration Tests**:
```bash
cd code-academy-backend
DEBUG=* npm run test:integration
```

### Frontend Debugging

**Debug Unit Tests**:
```bash
cd code-academy-frontend
npm run test:ui
```

**Debug E2E Tests**:
```bash
cd code-academy-frontend
npm run test:e2e:headed
```

### Common Issues

**Database Connection**:
- Ensure PostgreSQL is running
- Check test database exists
- Verify connection string

**Mock Issues**:
- Check mock implementations
- Verify mock calls
- Reset mocks between tests

**Async Operations**:
- Use proper async/await
- Add appropriate timeouts
- Handle promise rejections

## 📝 Writing Tests

### Unit Test Example

```typescript
describe('AuthService', () => {
  it('should login successfully', async () => {
    const mockResponse = {
      data: { message: 'Login successful', tokens: { accessToken: 'token' } }
    }
    mockedAxios.post.mockResolvedValue(mockResponse)

    const result = await authService.login('test@example.com', 'password')

    expect(result).toEqual(mockResponse.data)
    expect(mockedAxios.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'password'
    })
  })
})
```

### Integration Test Example

```typescript
describe('Authentication Flow', () => {
  it('should complete full authentication flow', async () => {
    // 1. Register user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201)

    // 2. Login user
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(200)

    // 3. Verify 2FA
    const verifyResponse = await request(app)
      .post('/api/auth/verify-2fa')
      .send(verifyData)
      .expect(200)

    expect(verifyResponse.body).toHaveProperty('tokens')
  })
})
```

### E2E Test Example

```typescript
test('should complete login flow', async ({ page }) => {
  await page.goto('/login')
  
  await page.getByLabel('Email address').fill('test@example.com')
  await page.getByLabel('Password').fill('password123')
  await page.getByRole('button', { name: 'Sign in' }).click()
  
  await expect(page).toHaveURL('/dashboard')
  await expect(page.getByText('Welcome, Test User')).toBeVisible()
})
```

## 🎯 Best Practices

### Test Organization

1. **Group related tests** in describe blocks
2. **Use descriptive test names** that explain the scenario
3. **Follow AAA pattern**: Arrange, Act, Assert
4. **Keep tests independent** and isolated
5. **Clean up after tests** to avoid side effects

### Mocking

1. **Mock external dependencies** only
2. **Use realistic mock data** that matches real responses
3. **Reset mocks** between tests
4. **Verify mock calls** when important
5. **Keep mocks simple** and focused

### Assertions

1. **Use specific assertions** instead of generic ones
2. **Test both positive and negative cases**
3. **Verify error handling** and edge cases
4. **Check side effects** when relevant
5. **Use meaningful error messages**

### Performance

1. **Run tests in parallel** when possible
2. **Use appropriate timeouts** for async operations
3. **Mock heavy operations** like file I/O
4. **Clean up resources** after tests
5. **Monitor test execution time**

## 📈 Monitoring and Reporting

### Test Metrics

- **Test Coverage**: Track coverage trends
- **Test Duration**: Monitor execution time
- **Flaky Tests**: Identify unstable tests
- **Test Failures**: Track failure rates

### Reports

- **Coverage Reports**: HTML and LCOV formats
- **Test Results**: JUnit and JSON formats
- **Performance Metrics**: Execution time tracking
- **Quality Gates**: Coverage and pass rate thresholds

## 🚨 Troubleshooting

### Common Problems

**Tests Failing**:
- Check test data and mocks
- Verify environment setup
- Review error messages and stack traces

**Coverage Issues**:
- Ensure all code paths are tested
- Check for untested error cases
- Verify mock coverage

**Performance Issues**:
- Optimize test setup and teardown
- Use appropriate timeouts
- Consider test parallelization

### Getting Help

- **Documentation**: Check this guide and inline comments
- **Logs**: Review test output and error messages
- **Debugging**: Use debug tools and verbose output
- **Community**: Reach out to the development team

---

**Happy Testing! 🧪✨**
