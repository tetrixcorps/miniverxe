#!/usr/bin/env node

/**
 * TETRIX 2FA Integration Test Script
 * Tests the complete 2FA flow for both JoRoMi and Client Login buttons
 */

import https from 'https';
import http from 'http';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class TwoFATester {
  constructor() {
    this.baseUrl = 'http://localhost:8080';
    this.testResults = [];
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      
      const req = protocol.request(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const jsonData = data ? JSON.parse(data) : {};
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: jsonData,
              rawData: data
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: null,
              rawData: data
            });
          }
        });
      });

      req.on('error', reject);
      
      if (options.body) {
        req.write(JSON.stringify(options.body));
      }
      
      req.end();
    });
  }

  async testHomepageLoad() {
    this.log('\n🔍 Testing Homepage Load...', 'blue');
    
    try {
      const response = await this.makeRequest(this.baseUrl);
      
      if (response.status === 200) {
        const hasJoRoMiButton = response.rawData.includes('joromi-2fa-btn');
        const hasClientLoginButton = response.rawData.includes('client-login-2fa-btn');
        const has2FAModal = response.rawData.includes('2fa-modal');
        
        this.log(`✅ Homepage loaded successfully (${response.status})`, 'green');
        this.log(`✅ JoRoMi 2FA button found: ${hasJoRoMiButton}`, hasJoRoMiButton ? 'green' : 'red');
        this.log(`✅ Client Login 2FA button found: ${hasClientLoginButton}`, hasClientLoginButton ? 'green' : 'red');
        this.log(`✅ 2FA Modal component found: ${has2FAModal}`, has2FAModal ? 'green' : 'red');
        
        this.testResults.push({
          test: 'Homepage Load',
          status: 'PASS',
          details: {
            statusCode: response.status,
            joRoMiButton: hasJoRoMiButton,
            clientLoginButton: hasClientLoginButton,
            twoFAModal: has2FAModal
          }
        });
        
        return true;
      } else {
        this.log(`❌ Homepage failed to load (${response.status})`, 'red');
        this.testResults.push({
          test: 'Homepage Load',
          status: 'FAIL',
          details: { statusCode: response.status }
        });
        return false;
      }
    } catch (error) {
      this.log(`❌ Homepage test failed: ${error.message}`, 'red');
      this.testResults.push({
        test: 'Homepage Load',
        status: 'FAIL',
        details: { error: error.message }
      });
      return false;
    }
  }

  async test2FAInitiateAPI() {
    this.log('\n🔍 Testing 2FA Initiate API...', 'blue');
    
    try {
      const testPhone = '+15551234567';
      const response = await this.makeRequest(`${this.baseUrl}/api/v2/2fa/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          phoneNumber: testPhone,
          method: 'sms',
          userAgent: 'TETRIX-2FA-Test/1.0',
          ipAddress: '127.0.0.1',
          sessionId: 'test_session_' + Date.now()
        }
      });

      if (response.status === 200 && response.data && response.data.success) {
        this.log(`✅ 2FA Initiate API working`, 'green');
        this.log(`   Verification ID: ${response.data.verificationId}`, 'cyan');
        this.log(`   Method: ${response.data.method}`, 'cyan');
        this.log(`   Expires: ${response.data.expiresAt}`, 'cyan');
        
        this.testResults.push({
          test: '2FA Initiate API',
          status: 'PASS',
          details: response.data
        });
        
        return response.data.verificationId;
      } else {
        this.log(`❌ 2FA Initiate API failed (${response.status})`, 'red');
        this.log(`   Response: ${JSON.stringify(response.data)}`, 'yellow');
        
        this.testResults.push({
          test: '2FA Initiate API',
          status: 'FAIL',
          details: { status: response.status, data: response.data }
        });
        return null;
      }
    } catch (error) {
      this.log(`❌ 2FA Initiate API test failed: ${error.message}`, 'red');
      this.testResults.push({
        test: '2FA Initiate API',
        status: 'FAIL',
        details: { error: error.message }
      });
      return null;
    }
  }

  async test2FAVerifyAPI(verificationId) {
    this.log('\n🔍 Testing 2FA Verify API...', 'blue');
    
    if (!verificationId) {
      this.log('⚠️  Skipping verify test - no verification ID', 'yellow');
      return false;
    }

    try {
      const testCode = '123456';
      const response = await this.makeRequest(`${this.baseUrl}/api/v2/2fa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          verificationId: verificationId,
          code: testCode,
          phoneNumber: '+15551234567'
        }
      });

      if (response.status === 200) {
        this.log(`✅ 2FA Verify API responded`, 'green');
        this.log(`   Success: ${response.data?.success || false}`, 'cyan');
        this.log(`   Message: ${response.data?.message || 'No message'}`, 'cyan');
        
        this.testResults.push({
          test: '2FA Verify API',
          status: 'PASS',
          details: response.data
        });
        
        return true;
      } else {
        this.log(`❌ 2FA Verify API failed (${response.status})`, 'red');
        this.log(`   Response: ${JSON.stringify(response.data)}`, 'yellow');
        
        this.testResults.push({
          test: '2FA Verify API',
          status: 'FAIL',
          details: { status: response.status, data: response.data }
        });
        return false;
      }
    } catch (error) {
      this.log(`❌ 2FA Verify API test failed: ${error.message}`, 'red');
      this.testResults.push({
        test: '2FA Verify API',
        status: 'FAIL',
        details: { error: error.message }
      });
      return false;
    }
  }

  async testDashboardAccess() {
    this.log('\n🔍 Testing Dashboard Access...', 'blue');
    
    try {
      const response = await this.makeRequest(`${this.baseUrl}/dashboard`);
      
      if (response.status === 200) {
        const hasDashboardContent = response.rawData.includes('Enterprise Dashboard');
        const hasQuickStats = response.rawData.includes('Voice API Calls');
        const hasSecurityStatus = response.rawData.includes('Security Status');
        
        this.log(`✅ Dashboard loaded successfully (${response.status})`, 'green');
        this.log(`✅ Dashboard content found: ${hasDashboardContent}`, hasDashboardContent ? 'green' : 'red');
        this.log(`✅ Quick stats found: ${hasQuickStats}`, hasQuickStats ? 'green' : 'red');
        this.log(`✅ Security status found: ${hasSecurityStatus}`, hasSecurityStatus ? 'green' : 'red');
        
        this.testResults.push({
          test: 'Dashboard Access',
          status: 'PASS',
          details: {
            statusCode: response.status,
            dashboardContent: hasDashboardContent,
            quickStats: hasQuickStats,
            securityStatus: hasSecurityStatus
          }
        });
        
        return true;
      } else {
        this.log(`❌ Dashboard failed to load (${response.status})`, 'red');
        this.testResults.push({
          test: 'Dashboard Access',
          status: 'FAIL',
          details: { statusCode: response.status }
        });
        return false;
      }
    } catch (error) {
      this.log(`❌ Dashboard test failed: ${error.message}`, 'red');
      this.testResults.push({
        test: 'Dashboard Access',
        status: 'FAIL',
        details: { error: error.message }
      });
      return false;
    }
  }

  async testJoRoMiIntegration() {
    this.log('\n🔍 Testing JoRoMi Integration...', 'blue');
    
    try {
      // Test if JoRoMi is running
      const joromiResponse = await this.makeRequest('http://localhost:3000');
      
      if (joromiResponse.status === 200) {
        this.log(`✅ JoRoMi platform is running`, 'green');
        this.log(`   Status: ${joromiResponse.status}`, 'cyan');
        
        this.testResults.push({
          test: 'JoRoMi Integration',
          status: 'PASS',
          details: { status: joromiResponse.status }
        });
        
        return true;
      } else {
        this.log(`❌ JoRoMi platform not accessible (${joromiResponse.status})`, 'red');
        this.testResults.push({
          test: 'JoRoMi Integration',
          status: 'FAIL',
          details: { status: joromiResponse.status }
        });
        return false;
      }
    } catch (error) {
      this.log(`❌ JoRoMi integration test failed: ${error.message}`, 'red');
      this.log(`   Make sure JoRoMi is running on port 3000`, 'yellow');
      
      this.testResults.push({
        test: 'JoRoMi Integration',
        status: 'FAIL',
        details: { error: error.message }
      });
      return false;
    }
  }

  printSummary() {
    this.log('\n' + '='.repeat(60), 'blue');
    this.log('📊 TETRIX 2FA Integration Test Summary', 'bright');
    this.log('='.repeat(60), 'blue');
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const total = this.testResults.length;
    
    this.log(`\nTotal Tests: ${total}`, 'cyan');
    this.log(`✅ Passed: ${passed}`, 'green');
    this.log(`❌ Failed: ${failed}`, 'red');
    this.log(`Success Rate: ${Math.round((passed / total) * 100)}%`, passed === total ? 'green' : 'yellow');
    
    this.log('\n📋 Detailed Results:', 'blue');
    this.testResults.forEach((result, index) => {
      const status = result.status === 'PASS' ? '✅' : '❌';
      const color = result.status === 'PASS' ? 'green' : 'red';
      this.log(`${index + 1}. ${status} ${result.test}`, color);
      
      if (result.details && Object.keys(result.details).length > 0) {
        console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
      }
    });
    
    this.log('\n🎯 Next Steps:', 'yellow');
    if (failed === 0) {
      this.log('• All tests passed! 2FA integration is working correctly', 'green');
      this.log('• You can now test the buttons in the browser', 'green');
      this.log('• Click "JoRoMi" or "Client Login" to see the 2FA modal', 'green');
    } else {
      this.log('• Fix the failed tests before proceeding', 'red');
      this.log('• Check that all services are running', 'red');
      this.log('• Verify the API endpoints are accessible', 'red');
    }
    
    this.log('\n' + '='.repeat(60), 'blue');
  }

  async runAllTests() {
    this.log('🚀 Starting TETRIX 2FA Integration Tests...', 'bright');
    this.log('='.repeat(60), 'blue');
    
    // Test 1: Homepage Load
    await this.testHomepageLoad();
    
    // Test 2: 2FA Initiate API
    const verificationId = await this.test2FAInitiateAPI();
    
    // Test 3: 2FA Verify API
    await this.test2FAVerifyAPI(verificationId);
    
    // Test 4: Dashboard Access
    await this.testDashboardAccess();
    
    // Test 5: JoRoMi Integration
    await this.testJoRoMiIntegration();
    
    // Print Summary
    this.printSummary();
  }
}

// Run the tests
const tester = new TwoFATester();
tester.runAllTests().catch(console.error);

export default TwoFATester;
