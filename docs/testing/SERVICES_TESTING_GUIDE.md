# TETRIX Services Unit Testing Guide

## Overview

This guide provides comprehensive instructions for running unit tests across all TETRIX services, including API Service, eSIM Ordering Service, Phone Provisioning Service, and OAuth Auth Service.

## Services Overview

### 1. TETRIX API Service
- **Port**: 4000
- **Path**: `services/api`
- **Dependencies**: Express, CORS, Prisma
- **Endpoints**: Health, Tickets, Projects, Users, Wallet, Auth, Contact, Analytics

### 2. eSIM Ordering Service
- **Port**: 4001
- **Path**: `services/esim-ordering`
- **Dependencies**: Express, Axios
- **Endpoints**: Health, Orders, eSIM, Provisioning, Status

### 3. Phone Provisioning Service
- **Port**: 4002
- **Path**: `services/phone-provisioning`
- **Dependencies**: Express, Axios
- **Endpoints**: Health, Provision, Numbers, Status, Webhooks

### 4. OAuth Auth Service
- **Port**: 4003
- **Path**: `services/oauth-auth-service`
- **Dependencies**: Express, Passport, JWT
- **Endpoints**: Health, Auth, Token, Refresh, User

## Quick Start

### Run All Services Tests
```bash
# Run structure tests (recommended)
pnpm run test:services:simple

# Run full service tests (requires services running)
pnpm run test:services
```

### Run Specific Service Tests
```bash
# API Service
pnpm run test:services:api

# eSIM Ordering Service
pnpm run test:services:esim

# Phone Provisioning Service
pnpm run test:services:phone

# OAuth Auth Service
pnpm run test:services:oauth
```

## Test Types

### 1. Structure Tests (Simple)
- **Purpose**: Test service structure and dependencies without running services
- **Speed**: Fast execution (< 1 second per service)
- **Dependencies**: None
- **Command**: `pnpm run test:services:simple`

### 2. Full Service Tests
- **Purpose**: Test running services with actual HTTP requests
- **Speed**: Slower execution (requires service startup)
- **Dependencies**: Services must be running
- **Command**: `pnpm run test:services`

## Test Scripts

### Simple Services Test Runner
```bash
# Test all services structure
node scripts/test-services-simple.js --service=all --verbose

# Test specific service
node scripts/test-services-simple.js --service=api --verbose
```

### Full Services Test Runner
```bash
# Test all services (requires services running)
node scripts/test-services.js --service=all --verbose

# Test specific service
node scripts/test-services.js --service=api --verbose
```

## Test Coverage

### API Service Tests
- **Health Checks**: Service status and CORS configuration
- **Tickets Management**: Create, read, update tickets
- **Projects Management**: Project lifecycle management
- **Users Management**: User authentication and profiles
- **Wallet Management**: Financial transactions and balances
- **Analytics**: System metrics and usage tracking
- **Contact Support**: Customer support and feedback
- **Error Handling**: Invalid requests and malformed data

### eSIM Ordering Service Tests
- **Order Management**: Create, update, cancel orders
- **eSIM Provisioning**: Activation, deactivation, status
- **Data Plan Management**: Plan selection and upgrades
- **Billing and Payments**: Payment processing and refunds
- **Webhooks and Notifications**: Order status and notifications
- **Integration Tests**: Complete order flow

### Phone Provisioning Service Tests
- **Number Provisioning**: Phone number allocation and release
- **Carrier Integration**: Carrier configuration and status
- **Number Management**: Configuration and porting
- **Webhooks and Events**: Carrier webhooks and status updates
- **Billing and Usage**: Usage statistics and alerts
- **Integration Tests**: Complete provisioning flow

### OAuth Auth Service Tests
- **Authentication**: Login, registration, password reset
- **Token Management**: Generation, validation, refresh, revocation
- **OAuth Flows**: Authorization code, client credentials, implicit
- **User Management**: Profiles, sessions, logout
- **Client Management**: Registration, configuration, secret rotation
- **Security Features**: Rate limiting, brute force protection
- **Integration Tests**: Complete OAuth flow

## Test Configuration

### Service Ports
```javascript
const services = {
  api: { port: 4000 },
  esim: { port: 4001 },
  phone: { port: 4002 },
  oauth: { port: 4003 }
};
```

### Test Timeouts
- **Default**: 10000ms (10 seconds)
- **Service Startup**: 30000ms (30 seconds)
- **HTTP Requests**: 5000ms (5 seconds)

### CORS Configuration
All services are configured with CORS for cross-platform communication:
- **Allowed Origins**: tetrixcorp.com, joromi.ai, iot.tetrixcorp.com
- **Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Headers**: Content-Type, Authorization, X-Requested-With

## Running Tests

### Development Workflow
```bash
# 1. Test service structure first
pnpm run test:services:simple

# 2. Start services (if needed)
# Each service needs to be started individually

# 3. Run full service tests
pnpm run test:services

# 4. Run specific service tests
pnpm run test:services:api
```

### CI/CD Pipeline
```bash
# 1. Install dependencies
pnpm install

# 2. Test service structure
pnpm run test:services:simple

# 3. Start services in background
# (Each service needs individual startup)

# 4. Run full service tests
pnpm run test:services
```

## Test Results

### Structure Test Results
- **Total Tests**: 16 (4 tests × 4 services)
- **Pass Rate**: 100% (all structure tests passed)
- **Report**: `test-results/services-structure-report.html`

### Full Service Test Results
- **Total Tests**: Varies by service
- **Pass Rate**: Depends on service availability
- **Report**: `test-results/services-test-report.html`

## Test Reports

### HTML Reports
- **Structure Report**: `test-results/services-structure-report.html`
- **Full Service Report**: `test-results/services-test-report.html`
- **Features**: Pass/fail rates, service status, error details

### Report Contents
- **Service Status**: Running/stopped status
- **Endpoint Tests**: HTTP endpoint validation
- **Dependency Checks**: Required dependencies
- **Error Details**: Specific error messages

## Troubleshooting

### Common Issues

#### 1. Services Not Starting
```bash
# Check if ports are available
netstat -tlnp | grep :4000
netstat -tlnp | grep :4001
netstat -tlnp | grep :4002
netstat -tlnp | grep :4003

# Kill conflicting processes
kill -9 <PID>
```

#### 2. Missing Dependencies
```bash
# Install service dependencies
cd services/api && npm install
cd services/esim-ordering && npm install
cd services/phone-provisioning && npm install
cd services/oauth-auth-service && npm install
```

#### 3. TypeScript Compilation Errors
```bash
# Check TypeScript configuration
cd services/api && npx tsc --noEmit
cd services/esim-ordering && npx tsc --noEmit
```

#### 4. CORS Issues
```bash
# Test CORS configuration
curl -H "Origin: https://tetrixcorp.com" \
     -H "Access-Control-Request-Method: GET" \
     http://localhost:4000/health
```

### Debug Mode
```bash
# Enable verbose output
node scripts/test-services-simple.js --service=all --verbose

# Test specific service with debug
node scripts/test-services.js --service=api --verbose
```

## Best Practices

### 1. Test Structure
- Test service structure before running full tests
- Use structure tests for CI/CD pipelines
- Use full tests for development validation

### 2. Service Management
- Start services individually for testing
- Use different ports for each service
- Monitor service health during tests

### 3. Error Handling
- Check service logs for startup issues
- Validate CORS configuration
- Test with different origins

### 4. Performance
- Use structure tests for fast feedback
- Run full tests only when needed
- Monitor service startup times

## Integration with CI/CD

### GitHub Actions
```yaml
name: Services Tests
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
      - run: pnpm run test:services:simple
      - run: pnpm run test:services
```

### Docker Integration
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run test:services:simple
```

## Monitoring and Reporting

### Test Metrics
- Service availability
- Endpoint response times
- CORS configuration
- Dependency status

### Alerts
- Service startup failures
- Endpoint timeouts
- CORS configuration issues
- Missing dependencies

## Support

For questions or issues with services testing:

1. Check the troubleshooting section
2. Review service logs and error messages
3. Verify service configuration
4. Check CORS and dependency setup
5. Contact the development team

## Additional Resources

- [Express.js Testing](https://expressjs.com/en/guide/testing.html)
- [Jest Testing Framework](https://jestjs.io/)
- [Playwright Testing](https://playwright.dev/)
- [CORS Configuration](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Services Architecture](https://docs.tetrixcorp.com/services)
