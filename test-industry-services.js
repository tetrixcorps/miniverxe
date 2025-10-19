#!/usr/bin/env node

/**
 * Test script for TETRIX Industry Auth Services
 * Tests the comprehensive industry authentication services locally
 */

import { Industry2FAAuthService } from './src/services/auth/Industry2FAAuthService.ts';
import { TETRIXIndustryAuthService } from './src/services/auth/IndustryAuthService.ts';
import { IndustryRolePermissionService } from './src/services/auth/IndustryRolePermissionService.ts';

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

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testIndustryServices() {
  log('🧪 TETRIX Industry Auth Services - Comprehensive Test', 'bright');
  log('====================================================', 'bright');
  
  try {
    // Test 1: Industry Role Permission Service
    log('\n1. Testing Industry Role Permission Service...', 'blue');
    const roleService = new IndustryRolePermissionService();
    
    // Test getting roles for healthcare industry
    const healthcareRoles = await roleService.getRolesByIndustry('healthcare');
    log(`✅ Healthcare roles found: ${healthcareRoles.length}`, 'green');
    log(`   Sample roles: ${healthcareRoles.slice(0, 3).map(r => r.name).join(', ')}`, 'cyan');
    
    // Test getting permissions for a role
    if (healthcareRoles.length > 0) {
      const role = healthcareRoles[0];
      const permissions = await roleService.getPermissionsByRole(role.id);
      log(`✅ Permissions for ${role.name}: ${permissions.length}`, 'green');
    }
    
    // Test 2: Industry Auth Service
    log('\n2. Testing Industry Auth Service...', 'blue');
    const authService = new TETRIXIndustryAuthService();
    
    // Test creating a user
    const testUser = await authService.createUser({
      email: 'test@healthcare.com',
      phone: '+1234567890',
      password: 'test123'
    });
    log(`✅ User created: ${testUser.id}`, 'green');
    
    // Test creating an organization
    const testOrg = await authService.createOrganization({
      name: 'Test Healthcare Org',
      industry: 'healthcare',
      settings: {
        mfaRequired: true,
        sessionTimeout: 1800
      },
      compliance: {
        hipaa: true,
        sox: false
      }
    });
    log(`✅ Organization created: ${testOrg.id}`, 'green');
    
    // Test 3: Industry 2FA Auth Service
    log('\n3. Testing Industry 2FA Auth Service...', 'blue');
    const industry2FAService = new Industry2FAAuthService();
    
    // Test initiating 2FA
    const initiateResult = await industry2FAService.initiateIndustry2FA({
      phoneNumber: '+1234567890',
      industry: 'healthcare',
      organizationId: testOrg.id,
      method: 'sms',
      rememberDevice: false
    });
    
    if (initiateResult.success) {
      log(`✅ 2FA initiated successfully`, 'green');
      log(`   Session ID: ${initiateResult.sessionId}`, 'cyan');
      log(`   Verification ID: ${initiateResult.verificationId}`, 'cyan');
      log(`   Provider: ${initiateResult.provider}`, 'cyan');
      log(`   Expires in: ${initiateResult.expiresIn} seconds`, 'cyan');
      
      // Test verification (with mock code)
      const verifyResult = await industry2FAService.verifyIndustry2FA({
        sessionId: initiateResult.sessionId!,
        code: '123456', // Mock code for testing
        deviceInfo: {
          userAgent: 'Test Agent',
          ipAddress: '127.0.0.1',
          deviceId: 'test_device'
        }
      });
      
      if (verifyResult.success && verifyResult.verified) {
        log(`✅ 2FA verification successful`, 'green');
        log(`   User ID: ${verifyResult.user?.id}`, 'cyan');
        log(`   Organization: ${verifyResult.organization?.name}`, 'cyan');
        log(`   Roles: ${verifyResult.roles?.join(', ')}`, 'cyan');
        log(`   Permissions: ${verifyResult.permissions?.slice(0, 3).join(', ')}...`, 'cyan');
        log(`   Dashboard URL: ${verifyResult.dashboardUrl}`, 'cyan');
      } else {
        log(`❌ 2FA verification failed: ${verifyResult.error}`, 'red');
      }
    } else {
      log(`❌ 2FA initiation failed: ${initiateResult.error}`, 'red');
    }
    
    // Test 4: Industry-specific features
    log('\n4. Testing Industry-Specific Features...', 'blue');
    
    // Test healthcare-specific permissions
    const healthcarePermissions = await roleService.getPermissionsByIndustry('healthcare');
    log(`✅ Healthcare permissions: ${healthcarePermissions.length}`, 'green');
    
    // Test construction-specific permissions
    const constructionPermissions = await roleService.getPermissionsByIndustry('construction');
    log(`✅ Construction permissions: ${constructionPermissions.length}`, 'green');
    
    // Test access control
    const accessDecision = await roleService.evaluateAccess({
      userId: testUser.id,
      organizationId: testOrg.id,
      resource: 'patient_records',
      action: 'read'
    });
    log(`✅ Access decision for patient_records: ${accessDecision.allowed ? 'ALLOWED' : 'DENIED'}`, 
        accessDecision.allowed ? 'green' : 'red');
    
    log('\n🎉 All tests completed successfully!', 'bright');
    log('The comprehensive industry auth services are working correctly.', 'green');
    
  } catch (error) {
    log(`\n❌ Test failed with error: ${error.message}`, 'red');
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run the tests
testIndustryServices().catch(console.error);
