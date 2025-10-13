# 🧪 TETRIX Dual Invoice Delivery Test Suite

Comprehensive test suite for the TETRIX dual invoice delivery system covering all pricing page services.

## 📋 Test Overview

This test suite validates the complete dual invoice delivery pipeline for:
- **Healthcare Services** (4 tiers)
- **Legal Services** (4 tiers) 
- **Business Services** (4 tiers)

## 🏗️ Test Structure

### **Unit Tests** (`tests/unit/`)
- **enhancedInvoiceService.test.ts** - Core invoice processing logic
- **enhancedStripeWebhookService.test.ts** - Webhook event handling
- **esimIntegrationService.test.ts** - eSIM ordering and activation

### **Functional Tests** (`tests/functional/`)
- **dualDeliveryPipeline.test.ts** - End-to-end delivery workflows
- Service-specific payment processing
- Error handling and recovery scenarios
- Bulk processing validation

### **Integration Tests** (`tests/integration/`)
- **fullSystemIntegration.test.ts** - Complete system integration
- Real service interactions
- Webhook-to-delivery pipeline
- Cross-service communication

## 🚀 Running Tests

### **Quick Start**
```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:unit
npm run test:functional
npm run test:integration

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### **Jest Commands**
```bash
# Direct Jest execution
npm run test:jest

# Specific test suites
npm run test:jest:unit
npm run test:jest:functional
npm run test:jest:integration

# Coverage report
npm run test:jest:coverage

# Watch mode
npm run test:jest:watch
```

### **CI/CD**
```bash
# Continuous integration
npm run test:ci
```

## 📊 Test Coverage

### **Coverage Targets**
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### **Coverage Reports**
- **Text**: Console output
- **HTML**: `coverage/index.html`
- **LCOV**: `coverage/lcov.info`

## 🧩 Test Utilities

### **Mock Services**
- **Stripe API** - Complete Stripe object mocking
- **Notification Service** - Email/SMS delivery simulation
- **eSIM Integration** - API call mocking
- **Webhook Events** - Stripe webhook simulation

### **Test Data**
- **Service Configurations** - All pricing page services
- **Customer Data** - Various customer profiles
- **Invoice Data** - Different payment scenarios
- **Error Scenarios** - Failure case simulation

### **Helper Functions**
- **Data Generators** - Bulk test data creation
- **Assertion Helpers** - Custom validation functions
- **Mock Factories** - Service mock creation

## 🔍 Test Scenarios

### **Healthcare Services**
- ✅ Individual Practice ($150/provider) - Email + SMS + Internal
- ✅ Small Practice ($200 base + $100/provider) - Email + SMS + Internal
- ✅ Professional ($500 base + $75/provider) - Email + SMS + Internal + eSIM
- ✅ Enterprise ($2,000 base + $50/provider) - Email + SMS + Internal + eSIM

### **Legal Services**
- ✅ Solo Practice ($150/attorney) - Email + SMS + Internal
- ✅ Small Firm ($500 base + $125/attorney) - Email + SMS + Internal
- ✅ Mid-Size Firm ($1,000 base + $100/attorney) - Email + SMS + Internal + eSIM
- ✅ Enterprise Law Firm ($3,000 base + $75/attorney) - Email + SMS + Internal + eSIM

### **Business Services**
- ✅ Starter ($99/month) - Email + SMS + Internal + eSIM
- ✅ Professional ($299/month) - Email + SMS + Internal + eSIM
- ✅ Enterprise ($799/month) - Email + SMS + Internal + eSIM
- ✅ Custom Enterprise (Contact Sales) - Email + SMS + Internal + eSIM

## 🛠️ Test Configuration

### **Jest Configuration** (`tests/jest.config.js`)
```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### **Environment Variables**
```bash
NODE_ENV=test
STRIPE_SECRET_KEY=sk_test_mock_key
STRIPE_WEBHOOK_SECRET=whsec_mock_secret
MAILGUN_API_KEY=key_mock_mailgun
MAILGUN_DOMAIN=mg.test.com
***REMOVED***=KEY_mock_telnyx
ESIM_API_BASE_URL=https://api.test-esim.com
ESIM_API_KEY=esim_mock_key
INTERNAL_SUPPORT_EMAIL=support@test.com
```

## 🐛 Debugging Tests

### **Verbose Output**
```bash
npm run test:jest -- --verbose
```

### **Specific Test File**
```bash
npm run test:jest tests/unit/enhancedInvoiceService.test.ts
```

### **Test Pattern Matching**
```bash
npm run test:jest -- --testNamePattern="should process healthcare"
```

### **Debug Mode**
```bash
node --inspect-brk node_modules/.bin/jest --config=tests/jest.config.js
```

## 📈 Performance Testing

### **Load Testing**
- Bulk invoice processing (100+ invoices)
- Concurrent webhook handling
- Memory usage monitoring
- Response time validation

### **Stress Testing**
- High-volume payment processing
- Service failure scenarios
- Network timeout handling
- Resource exhaustion recovery

## 🔒 Security Testing

### **Input Validation**
- Malicious webhook payloads
- Invalid invoice data
- SQL injection attempts
- XSS prevention

### **Authentication**
- Webhook signature verification
- API key validation
- Service authentication
- Access control testing

## 📝 Test Documentation

### **Test Reports**
- **Unit Test Results** - Individual component validation
- **Functional Test Results** - Workflow validation
- **Integration Test Results** - System validation
- **Coverage Reports** - Code coverage analysis

### **Test Metrics**
- **Test Execution Time** - Performance benchmarks
- **Success Rate** - Reliability metrics
- **Coverage Percentage** - Code coverage stats
- **Error Rate** - Failure analysis

## 🚀 Continuous Integration

### **GitHub Actions**
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:ci
```

### **Pre-commit Hooks**
```bash
# Install pre-commit hook
npm run test:jest -- --passWithNoTests
```

## 📞 Support

### **Test Issues**
- Check test logs for detailed error messages
- Verify environment variables are set correctly
- Ensure all dependencies are installed
- Review test data and mock configurations

### **Debugging Tips**
- Use `console.log` in tests for debugging
- Check Jest configuration for correct paths
- Verify TypeScript compilation
- Review mock service implementations

---

## ✅ Test Checklist

- [x] Unit tests for all services
- [x] Functional tests for workflows
- [x] Integration tests for system
- [x] Error handling validation
- [x] Performance testing
- [x] Security testing
- [x] Coverage reporting
- [x] CI/CD integration
- [x] Documentation
- [x] Mock services

**Ready for Production! 🚀**