# 🚀 Postman Testing Guide for TETRIX Authentication System

**Updated:** January 10, 2025  
**Collection:** `postman-collection.json`  
**Version:** 2.0

## 📋 Overview

This guide provides comprehensive instructions for testing the TETRIX authentication system using Postman. The collection includes updated v2 API endpoints for 2FA authentication and industry-specific authentication flows.

## 🔧 Setup Instructions

### 1. Import Collection
1. Open Postman
2. Click **Import** button
3. Select `postman-collection.json` from the project root
4. The collection will be imported with all test cases

### 2. Environment Variables
The collection uses the following variables:

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `baseUrl` | `http://localhost:4321` | Base URL for API requests |
| `testPhone` | `+1234567890` | Test phone number for 2FA |
| `testSessionId` | `test_session_123` | Test session identifier |
| `verificationId` | *(auto-populated)* | 2FA verification ID |
| `authToken` | *(auto-populated)* | Authentication token |
| `industryAuthToken` | *(auto-populated)* | Industry auth token |

### 3. Start Development Server
```bash
npm run dev
# Server will start on http://localhost:4321
```

## 🧪 Test Categories

### 1. 2FA API v2 - Authentication

#### **Initiate 2FA Verification (SMS)**
- **Endpoint:** `POST /api/v2/2fa/initiate`
- **Purpose:** Test SMS-based 2FA initiation
- **Tests:**
  - Status code is 200
  - Response has success property
  - Response has verificationId
  - Response has estimated delivery time
  - Stores verificationId for next request

#### **Initiate 2FA Verification (Voice)**
- **Endpoint:** `POST /api/v2/2fa/initiate`
- **Purpose:** Test voice-based 2FA initiation
- **Tests:**
  - Status code is 200
  - Response has success property
  - Response has verificationId
  - Stores verificationId for next request

#### **Verify 2FA Code (Valid)**
- **Endpoint:** `POST /api/v2/2fa/verify`
- **Purpose:** Test valid code verification
- **Tests:**
  - Status code is 200
  - Response has success property
  - Response has verified property (true)
  - Response has token
  - Response has verificationId
  - Response has phoneNumber
  - Stores auth token for future requests

#### **Verify 2FA Code (Invalid)**
- **Endpoint:** `POST /api/v2/2fa/verify`
- **Purpose:** Test invalid code handling
- **Tests:**
  - Status code is 400
  - Response has success property (false)
  - Response has error message

#### **Check 2FA Status**
- **Endpoint:** `GET /api/v2/2fa/status`
- **Purpose:** Test verification status checking
- **Tests:**
  - Status code is 200
  - Response has success property
  - Response has data object
  - Data has verificationId
  - Data has status

#### **Get 2FA Audit Logs**
- **Endpoint:** `GET /api/v2/2fa/audit`
- **Purpose:** Test audit log retrieval
- **Tests:**
  - Status code is 200
  - Response has success property
  - Response has logs array

### 2. Industry Authentication API

#### **Industry Auth - Healthcare**
- **Endpoint:** `POST /api/v2/industry-auth/initiate`
- **Purpose:** Test healthcare industry authentication
- **Tests:**
  - Status code is 200
  - Response has success property
  - Response has industry data (healthcare)
  - Response has role data (doctor)
  - Response has organization data
  - Response has auth token
  - Stores industry auth token

#### **Industry Auth - Construction**
- **Endpoint:** `POST /api/v2/industry-auth/initiate`
- **Purpose:** Test construction industry authentication
- **Tests:**
  - Status code is 200
  - Response has success property
  - Response has industry data (construction)
  - Response has role data (project_manager)

#### **Industry Auth - Invalid Industry**
- **Endpoint:** `POST /api/v2/industry-auth/initiate`
- **Purpose:** Test invalid industry handling
- **Tests:**
  - Status code is 400
  - Response has success property (false)
  - Response has error message

## 🚀 Running Tests

### Method 1: Postman UI
1. Open the collection in Postman
2. Click **Run** button next to collection name
3. Select all tests or specific folders
4. Click **Run TETRIX Cross-Platform Management Services API Tests**
5. Review test results in the runner

### Method 2: Newman CLI
```bash
# Install Newman globally
npm install -g newman

# Run the collection
newman run postman-collection.json

# Run with environment file
newman run postman-collection.json -e environment.json

# Run with HTML report
newman run postman-collection.json -r html --reporter-html-export report.html
```

### Method 3: Individual Requests
1. Select any request from the collection
2. Click **Send** button
3. View response and test results in the **Test Results** tab

## 📊 Expected Results

### Successful Test Run
```
✅ 2FA API v2 - Authentication
  ✅ Initiate 2FA Verification (SMS) - 5/5 tests passed
  ✅ Initiate 2FA Verification (Voice) - 4/4 tests passed
  ✅ Verify 2FA Code (Valid) - 7/7 tests passed
  ✅ Verify 2FA Code (Invalid) - 3/3 tests passed
  ✅ Check 2FA Status - 5/5 tests passed
  ✅ Get 2FA Audit Logs - 3/3 tests passed

✅ Industry Authentication API
  ✅ Industry Auth - Healthcare - 6/6 tests passed
  ✅ Industry Auth - Construction - 4/4 tests passed
  ✅ Industry Auth - Invalid Industry - 3/3 tests passed
```

### Common Issues and Solutions

#### Issue: 404 Not Found
**Cause:** API endpoints not implemented or server not running  
**Solution:** 
1. Ensure development server is running (`npm run dev`)
2. Check that API routes exist in `src/pages/api/v2/2fa/`

#### Issue: 400 Bad Request - Missing required field
**Cause:** Request body parsing issues  
**Solution:**
1. Check Content-Type header is set to `application/json`
2. Verify request body format matches API specification

#### Issue: 500 Internal Server Error
**Cause:** Server-side error in API implementation  
**Solution:**
1. Check server logs for detailed error messages
2. Verify all required environment variables are set
3. Ensure external service integrations are configured

## 🔍 Debugging Tips

### 1. Check Request/Response
- Use Postman Console to view detailed request/response data
- Enable **Console** in Postman settings
- Check **Network** tab for HTTP details

### 2. Environment Variables
- Verify all variables are set correctly
- Use **Environment** dropdown to switch between environments
- Check variable values in **Environment** tab

### 3. Test Scripts
- Review test scripts in the **Tests** tab
- Add `console.log()` statements for debugging
- Check **Test Results** tab for detailed output

### 4. Collection Runner
- Use **Collection Runner** for batch testing
- Enable **Stop on first failure** for debugging
- Use **Delay** setting to avoid rate limiting

## 📈 Performance Testing

### Load Testing with Newman
```bash
# Run collection multiple times
newman run postman-collection.json -n 10

# Run with delay between requests
newman run postman-collection.json -d 1000

# Run with custom timeout
newman run postman-collection.json --timeout-request 30000
```

### Monitoring
- Use Postman Monitor for scheduled testing
- Set up alerts for test failures
- Track performance metrics over time

## 🔒 Security Testing

### Authentication Testing
- Test with invalid tokens
- Test with expired tokens
- Test with missing authentication headers

### Input Validation Testing
- Test with malformed phone numbers
- Test with invalid verification codes
- Test with SQL injection attempts
- Test with XSS payloads

### Rate Limiting Testing
- Send multiple rapid requests
- Test rate limit headers
- Verify rate limit reset behavior

## 📝 Customization

### Adding New Tests
1. Create new request in collection
2. Add test scripts in **Tests** tab
3. Use `pm.test()` for assertions
4. Use `pm.expect()` for detailed checks

### Environment Variables
1. Create new environment file
2. Add variables with different values
3. Use `{{variableName}}` syntax in requests
4. Switch environments as needed

### Pre-request Scripts
1. Add scripts in **Pre-request Script** tab
2. Generate dynamic data
3. Set environment variables
4. Add authentication headers

## 🎯 Best Practices

### 1. Test Organization
- Group related tests in folders
- Use descriptive test names
- Add test descriptions
- Maintain test documentation

### 2. Data Management
- Use environment variables for configuration
- Store dynamic data in collection variables
- Clean up test data after runs
- Use data files for large datasets

### 3. Error Handling
- Test both success and failure scenarios
- Validate error messages
- Check appropriate HTTP status codes
- Test edge cases and boundary conditions

### 4. Maintenance
- Keep tests up to date with API changes
- Remove obsolete tests
- Update test data regularly
- Review and refactor test scripts

## 📞 Support

### Troubleshooting
1. Check Postman documentation
2. Review API documentation
3. Check server logs
4. Verify network connectivity

### Getting Help
- Postman Community Forum
- TETRIX Development Team
- API Documentation
- Test Collection Comments

---

**Happy Testing! 🚀**

*This guide is maintained by the TETRIX Development Team. Last updated: January 10, 2025*
