# Voice API Test Suite

Comprehensive testing suite for the Voice API implementation using Playwright.

## 🧪 Test Structure

### Test Categories

1. **Unit Tests** (`tests/unit/`)
   - Individual component testing
   - API endpoint validation
   - Service layer testing
   - Error handling validation

2. **Integration Tests** (`tests/integration/`)
   - Cross-component integration
   - API workflow testing
   - Database integration
   - External service integration

3. **Functional Tests** (`tests/functional/`)
   - End-to-end user scenarios
   - UI interaction testing
   - Browser compatibility
   - Responsive design testing

4. **End-to-End Tests** (`tests/e2e/`)
   - Complete user journeys
   - Full system integration
   - Performance testing
   - Data consistency testing

## 🚀 Running Tests

### Prerequisites

```bash
# Install dependencies
pnpm install

# Install Playwright browsers
npx playwright install
```

### Test Commands

```bash
# Run all tests
pnpm test

# Run specific test categories
pnpm test:unit
pnpm test:integration
pnpm test:functional
pnpm test:e2e

# Run tests with UI
pnpm test:ui

# Run tests in headed mode (see browser)
pnpm test:headed

# Debug tests
pnpm test:debug

# Generate test report
pnpm test:report

# Run cross-platform integration tests
pnpm test:cross-platform
```

## 📋 Test Coverage

### Voice API Components

- ✅ **Telnyx Voice Service**
  - Call initiation
  - Call management
  - TeXML response generation
  - Webhook handling

- ✅ **Deepgram STT Integration**
  - Audio transcription
  - Batch processing
  - Language detection
  - Speaker diarization

- ✅ **SHANGO AI Integration**
  - Response generation
  - Context awareness
  - Multi-agent support
  - Confidence scoring

- ✅ **Cross-Platform Integration**
  - TETRIX ↔ JoRoMi sync
  - Session management
  - Channel synchronization
  - Message routing

### API Endpoints

- ✅ **Voice Call Management**
  - `POST /api/voice/initiate`
  - `GET /api/voice/sessions`
  - `GET /api/voice/sessions/:id`
  - `POST /api/voice/sessions/:id/end`

- ✅ **Transcription Processing**
  - `POST /api/voice/transcribe`
  - `GET /api/voice/transcribe/:id`
  - `POST /api/voice/transcribe/batch`
  - `GET /api/voice/transcribe/stats`

- ✅ **Webhook Handling**
  - `POST /api/voice/webhook`
  - `POST /api/voice/texml`

- ✅ **Cross-Platform Integration**
  - `POST /api/voice/integration/initiate`
  - `POST /api/voice/integration/transcribe`
  - `GET /api/voice/integration/sessions`
  - `GET /api/voice/integration/status`

- ✅ **Demo and Testing**
  - `POST /api/voice/demo/call`
  - `POST /api/voice/demo/texml`
  - `POST /api/voice/demo/ai-response`
  - `GET /api/voice/demo/capabilities`

## 🔧 Test Configuration

### Environment Variables

```bash
# Required for testing
BASE_URL=http://localhost:4321
***REMOVED***=your_telnyx_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key
WEBHOOK_BASE_URL=https://tetrixcorp.com

# Optional
NODE_ENV=test
TEST_PHONE_NUMBER=+1234567890
```

### Playwright Configuration

The test suite uses `playwright.config.ts` with the following features:

- **Multi-browser testing**: Chrome, Firefox, Safari
- **Mobile testing**: iPhone, Android
- **Parallel execution**: Faster test runs
- **Retry logic**: Automatic retry on failure
- **Screenshots**: On failure capture
- **Video recording**: On failure recording
- **HTML reports**: Detailed test reports

## 📊 Test Data

### Mock Data

The test suite includes comprehensive mock data:

- **Phone Numbers**: Valid and invalid formats
- **Audio URLs**: Test audio file URLs
- **Transcriptions**: Sample voice transcriptions
- **Session IDs**: Test session identifiers
- **API Responses**: Mock successful responses

### Test Utilities

- **API Helpers**: Reusable API interaction functions
- **Validation Helpers**: Data validation utilities
- **Assertion Helpers**: Custom assertion functions
- **Mock Generators**: Dynamic test data generation

## 🎯 Test Scenarios

### Unit Test Scenarios

1. **Phone Number Validation**
   - Valid E.164 format
   - Invalid formats
   - Edge cases

2. **API Request Validation**
   - Required fields
   - Data types
   - Format validation

3. **Error Handling**
   - Invalid inputs
   - Network errors
   - API errors

4. **Service Layer Testing**
   - Business logic
   - Data transformation
   - State management

### Integration Test Scenarios

1. **Voice Call Workflow**
   - Call initiation → Transcription → AI Response
   - TeXML response generation
   - Webhook event handling

2. **Cross-Platform Integration**
   - Session synchronization
   - Message routing
   - Channel switching

3. **Transcription Pipeline**
   - Audio processing
   - Batch operations
   - Statistics tracking

### Functional Test Scenarios

1. **User Interface Testing**
   - Form interactions
   - Button clicks
   - Input validation

2. **Browser Compatibility**
   - Chrome, Firefox, Safari
   - Mobile browsers
   - Responsive design

3. **Accessibility Testing**
   - Keyboard navigation
   - Screen reader support
   - ARIA labels

### End-to-End Test Scenarios

1. **Complete User Journeys**
   - Voice call initiation
   - Transcription processing
   - AI response generation
   - Cross-platform sync

2. **Performance Testing**
   - Concurrent requests
   - Large data processing
   - Response times

3. **Data Consistency**
   - Session persistence
   - State synchronization
   - Error recovery

## 📈 Test Reports

### HTML Report

```bash
pnpm test:report
```

Opens detailed HTML report with:
- Test results overview
- Failed test details
- Screenshots and videos
- Performance metrics
- Timeline view

### JSON Report

Test results are saved to `test-results/results.json` for CI/CD integration.

### JUnit Report

Test results are saved to `test-results/results.xml` for Jenkins integration.

## 🔍 Debugging Tests

### Debug Mode

```bash
pnpm test:debug
```

Opens Playwright Inspector for step-by-step debugging.

### UI Mode

```bash
pnpm test:ui
```

Opens Playwright UI for interactive test running and debugging.

### Code Generation

```bash
pnpm test:codegen
```

Generates test code by recording browser interactions.

## 🚨 Troubleshooting

### Common Issues

1. **Browser Installation**
   ```bash
   npx playwright install
   ```

2. **Missing Dependencies**
   ```bash
   pnpm install
   ```

3. **API Connection Issues**
   - Check BASE_URL configuration
   - Verify API keys
   - Ensure server is running

4. **Test Timeouts**
   - Increase timeout in playwright.config.ts
   - Check network connectivity
   - Verify API response times

### Test Environment Setup

1. **Local Development**
   ```bash
   pnpm run dev
   pnpm test
   ```

2. **CI/CD Pipeline**
   ```bash
   pnpm install
   npx playwright install --with-deps
   pnpm test
   ```

## 📝 Writing New Tests

### Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { VoiceAPIHelper } from './helpers/api-helpers';

test.describe('Feature Name', () => {
  test('should do something', async ({ request }) => {
    const api = new VoiceAPIHelper(request);
    
    // Test implementation
    const result = await api.someMethod();
    
    // Assertions
    expect(result.response.status()).toBe(200);
    expect(result.data.success).toBe(true);
  });
});
```

### Best Practices

1. **Use descriptive test names**
2. **Group related tests in describe blocks**
3. **Use helper functions for common operations**
4. **Include both positive and negative test cases**
5. **Clean up test data after tests**
6. **Use proper assertions**
7. **Handle async operations correctly**

## 🤝 Contributing

1. **Add new tests** for new features
2. **Update existing tests** when APIs change
3. **Maintain test coverage** above 80%
4. **Follow naming conventions**
5. **Document test scenarios**
6. **Run tests before submitting**

## 📞 Support

For test-related issues:
- Check the troubleshooting section
- Review test logs and reports
- Verify environment configuration
- Contact the development team
