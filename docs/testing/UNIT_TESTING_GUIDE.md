# TETRIX Cross-Platform Unit Testing Guide

## Overview

This guide provides comprehensive instructions for running unit tests across the TETRIX cross-platform management system, including TETRIX Voice API, JoRoMi VoIP Management, and GLO M2M Services.

## Quick Start

### Run All Unit Tests
```bash
# Run all unit tests
pnpm run test:unit:all

# Run with coverage
pnpm run test:unit:coverage

# Run in watch mode
pnpm run test:unit:watch
```

### Run Specific Component Tests
```bash
# TETRIX Voice API only
pnpm run test:unit

# JoRoMi VoIP Management
node scripts/run-unit-tests.js --component=joromi

# GLO M2M Services
node scripts/run-unit-tests.js --component=glo
```

## Test Scripts

### Main Unit Testing Script
```bash
# Basic usage
node scripts/run-unit-tests.js

# With options
node scripts/run-unit-tests.js --component=tetrix --coverage --verbose

# Watch mode for development
node scripts/run-unit-tests.js --component=tetrix --watch
```

### Shell Script Alternative
```bash
# Run comprehensive tests
./scripts/run-voice-api-tests.sh --component=all --coverage

# Run with specific options
./scripts/run-voice-api-tests.sh --component=tetrix --verbose --parallel
```

## Available Options

### Component Selection
- `--component=tetrix` - Test TETRIX Voice API only
- `--component=joromi` - Test JoRoMi VoIP Management only  
- `--component=glo` - Test GLO M2M Services only
- `--component=all` - Test all components (default)

### Test Execution
- `--coverage` - Generate coverage report
- `--watch` - Watch mode for development
- `--verbose` - Verbose output
- `--parallel` - Run tests in parallel (default: true)

### Timeout and Retry
- `--timeout=<ms>` - Test timeout in milliseconds (default: 30000)
- `--retry=<count>` - Retry failed tests (default: 2)

### Reporting
- `--report=html` - HTML report (default)
- `--report=json` - JSON report
- `--report=junit` - JUnit XML report

## Test Structure

### Directory Layout
```
tests/
├── unit/                          # Unit tests
│   ├── api-service-unit.spec.ts  # TETRIX API service tests
│   ├── cross-platform-unit.spec.ts # Cross-platform integration tests
│   └── voice-api-unit.spec.ts     # Voice API specific tests
├── integration/                   # Integration tests
├── functional/                    # Functional tests
├── e2e/                          # End-to-end tests
├── config/                       # Test configuration
│   └── test-config.json         # Test configuration file
└── helpers/                      # Test utilities
```

### Test Categories

#### 1. Unit Tests (`tests/unit/`)
- **Purpose**: Test individual components in isolation
- **Scope**: Single functions, classes, or modules
- **Speed**: Fast execution (< 1 second per test)
- **Dependencies**: Mocked external dependencies

#### 2. Integration Tests (`tests/integration/`)
- **Purpose**: Test component interactions
- **Scope**: Multiple components working together
- **Speed**: Medium execution (1-10 seconds per test)
- **Dependencies**: Real external services (staged)

#### 3. Functional Tests (`tests/functional/`)
- **Purpose**: Test complete user workflows
- **Scope**: End-to-end user scenarios
- **Speed**: Slower execution (10-60 seconds per test)
- **Dependencies**: Full system integration

#### 4. End-to-End Tests (`tests/e2e/`)
- **Purpose**: Test complete system workflows
- **Scope**: Full system from user perspective
- **Speed**: Longest execution (1-5 minutes per test)
- **Dependencies**: Production-like environment

## Test Utilities

### Test Data Generators
```javascript
import { DataGenerators } from '../../scripts/test-utilities.js';

// Generate test phone numbers
const phoneNumber = DataGenerators.generatePhoneNumber('US');

// Generate test session IDs
const sessionId = DataGenerators.generateSessionId('test');

// Generate test audio URLs
const audioUrl = DataGenerators.generateAudioUrl('mp3');

// Generate test transcriptions
const transcription = DataGenerators.generateTranscription('short');
```

### Test Assertions
```javascript
import { Assertions } from '../../scripts/test-utilities.js';

// HTTP response assertions
Assertions.expectStatus(response, 200);
Assertions.expectJson(response);
Assertions.expectField(data, 'success', true);
Assertions.expectArray(data, 'sessions');
Assertions.expectDefined(data, 'timestamp');
```

### Mock Responses
```javascript
import { MockResponses } from '../../scripts/test-utilities.js';

// Use predefined mock responses
const mockResponse = MockResponses.voice.initiate.success;
const mockError = MockResponses.voice.initiate.error;
```

## Test Configuration

### Environment Variables
```bash
# Test environment
NODE_ENV=test
BASE_URL=http://localhost:3000

# Component-specific
TETRIX_API_URL=http://localhost:3000/api/voice
JOROMI_API_URL=http://localhost:3001/api/voip
GLO_API_URL=http://localhost:3002/api/m2m

# Cross-platform
CORS_ORIGINS=https://tetrixcorp.com,https://joromi.ai,https://iot.tetrixcorp.com
```

### Test Configuration File
The `tests/config/test-config.json` file contains:
- Test environment settings
- Component configurations
- Test type definitions
- Reporting options
- Cross-platform settings
- Security configurations
- Monitoring settings

## Running Tests

### Development Workflow
```bash
# 1. Start development server
pnpm run dev

# 2. Run unit tests in watch mode
pnpm run test:unit:watch

# 3. Run specific test file
npx playwright test tests/unit/api-service-unit.spec.ts

# 4. Run with debug mode
npx playwright test --debug tests/unit/
```

### CI/CD Pipeline
```bash
# 1. Install dependencies
pnpm install

# 2. Install Playwright browsers
pnpm exec playwright install

# 3. Run all tests
pnpm run test:unit:all

# 4. Generate coverage report
pnpm run test:unit:coverage
```

### Cross-Platform Testing
```bash
# Test all platforms
node scripts/run-unit-tests.js --component=all

# Test specific platform
node scripts/run-unit-tests.js --component=tetrix

# Test with cross-platform integration
node scripts/run-unit-tests.js --component=all --verbose
```

## Test Examples

### Voice API Unit Test
```typescript
test('should validate phone number format', async ({ request }) => {
  const response = await request.post('/api/voice/initiate', {
    data: {
      from: 'invalid-phone',
      to: '+0987654321'
    }
  });

  expect(response.status()).toBe(400);
  const data = await response.json();
  expect(data.error).toContain('Invalid phone number format');
});
```

### Cross-Platform Integration Test
```typescript
test('should handle cross-platform session sharing', async ({ request }) => {
  const sessionData = {
    platform: 'joromi',
    userId: 'user_123',
    sessionId: DataGenerators.generateSessionId('joromi')
  };

  const response = await request.post('/api/voice/sessions/cross-platform', {
    data: sessionData
  });

  expect([200, 201]).toContain(response.status());
  const data = await response.json();
  expect(data.success).toBe(true);
});
```

## Coverage Reports

### Generate Coverage Report
```bash
# Generate HTML coverage report
pnpm run test:unit:coverage

# View coverage report
open test-results/coverage/index.html
```

### Coverage Configuration
- **Threshold**: 80% minimum coverage
- **Exclusions**: Test files, configuration files
- **Reports**: HTML, JSON, LCOV formats
- **Output**: `test-results/coverage/`

## Troubleshooting

### Common Issues

#### 1. Tests Failing Due to Missing Dependencies
```bash
# Install missing dependencies
pnpm install
pnpm exec playwright install
```

#### 2. Port Conflicts
```bash
# Check for port conflicts
lsof -i :3000
lsof -i :3001
lsof -i :3002

# Kill conflicting processes
kill -9 <PID>
```

#### 3. CORS Issues
```bash
# Check CORS configuration
curl -H "Origin: https://tetrixcorp.com" \
     -H "Access-Control-Request-Method: POST" \
     http://localhost:3000/api/voice/health
```

#### 4. Test Timeouts
```bash
# Increase timeout
node scripts/run-unit-tests.js --timeout=60000

# Run tests sequentially
node scripts/run-unit-tests.js --parallel=false
```

### Debug Mode
```bash
# Run tests in debug mode
npx playwright test --debug tests/unit/

# Run specific test in debug mode
npx playwright test --debug tests/unit/api-service-unit.spec.ts
```

### Verbose Output
```bash
# Enable verbose output
node scripts/run-unit-tests.js --verbose

# Show detailed test results
npx playwright test --reporter=list
```

## Best Practices

### 1. Test Organization
- Group related tests in `describe` blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests independent and isolated

### 2. Test Data Management
- Use test data generators
- Mock external dependencies
- Clean up test data after tests
- Use realistic test data

### 3. Assertion Best Practices
- Use specific assertions
- Test both success and failure cases
- Validate response structure
- Check error messages

### 4. Performance Considerations
- Run tests in parallel when possible
- Use appropriate timeouts
- Mock slow external services
- Clean up resources after tests

### 5. Cross-Platform Testing
- Test CORS configuration
- Validate platform-specific features
- Test cross-platform communication
- Handle platform differences gracefully

## Integration with CI/CD

### GitHub Actions
```yaml
name: Unit Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm exec playwright install
      - run: pnpm run test:unit:all
      - run: pnpm run test:unit:coverage
```

### Docker Integration
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npx playwright install
COPY . .
RUN npm run test:unit:all
```

## Monitoring and Reporting

### Test Results
- **HTML Report**: `test-results/report.html`
- **JSON Report**: `test-results/results.json`
- **JUnit XML**: `test-results/results.xml`
- **Coverage Report**: `test-results/coverage/index.html`

### Metrics
- Test execution time
- Pass/fail rates
- Coverage percentages
- Cross-platform compatibility

### Alerts
- Failed tests
- Coverage below threshold
- Cross-platform integration issues
- Performance degradation

## Support

For questions or issues with unit testing:

1. Check the troubleshooting section
2. Review test logs and error messages
3. Verify test configuration
4. Check cross-platform connectivity
5. Contact the development team

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Jest Testing Framework](https://jestjs.io/)
- [Testing Best Practices](https://testingjavascript.com/)
- [Cross-Platform Testing Guide](https://docs.tetrixcorp.com/testing)
