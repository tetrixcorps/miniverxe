import { test, expect } from '@playwright/test';

test.describe('Authentication System Comparison', () => {
  let productionResults: any = {};
  let customDomainResults: any = {};

  test('should test production URL and capture results', async ({ page }) => {
    console.log('🔍 [COMPARISON] Testing production URL...');
    
    const results = {
      url: 'https://tetrix-minimal-uzzxn.ondigitalocean.app/',
      timestamp: new Date().toISOString(),
      scriptLoadTimes: [],
      functionAvailability: [],
      consoleLogs: [],
      errors: [],
      success: false
    };
    
    // Capture console output
    page.on('console', msg => {
      results.consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: Date.now()
      });
      
      if (msg.type() === 'error') {
        results.errors.push(msg.text());
      }
    });
    
    // Monitor script loading
    page.on('response', async response => {
      if (response.url().includes('.js')) {
        results.scriptLoadTimes.push({
          url: response.url(),
          status: response.status(),
          loadTime: Date.now()
        });
      }
    });
    
    try {
      await page.goto('https://tetrix-minimal-uzzxn.ondigitalocean.app/');
      await page.waitForLoadState('networkidle');
      
      // Check function availability
      const functions = await page.evaluate(() => {
        return {
          openIndustryAuthModal: typeof window.openIndustryAuthModal,
          open2FAModal: typeof window.open2FAModal,
          openClientLogin: typeof window.openClientLogin,
          tetrixAuthContext: typeof window.tetrixAuthContext,
          dashboardRoutingService: typeof window.dashboardRoutingService
        };
      });
      
      results.functionAvailability.push(functions);
      
      // Test Client Login button
      const clientLoginBtn = page.locator('#client-login-2fa-btn');
      await expect(clientLoginBtn).toBeVisible();
      
      await clientLoginBtn.click();
      await page.waitForTimeout(2000);
      
      // Check if modal opened
      const isModalVisible = await page.evaluate(() => {
        const modal = document.getElementById('industry-auth-modal');
        return modal && !modal.classList.contains('hidden');
      });
      
      results.success = isModalVisible;
      console.log(`✅ [PRODUCTION] Authentication test result: ${isModalVisible}`);
      
    } catch (error) {
      console.log(`❌ [PRODUCTION] Error: ${error.message}`);
      results.errors.push(error.message);
    }
    
    productionResults = results;
    console.log('📊 [PRODUCTION] Results captured:', results);
  });

  test('should test custom domain and capture results', async ({ page }) => {
    console.log('🔍 [COMPARISON] Testing custom domain...');
    
    const results = {
      url: 'https://tetrixcorp.com/',
      timestamp: new Date().toISOString(),
      scriptLoadTimes: [],
      functionAvailability: [],
      consoleLogs: [],
      errors: [],
      success: false
    };
    
    // Capture console output
    page.on('console', msg => {
      results.consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: Date.now()
      });
      
      if (msg.type() === 'error') {
        results.errors.push(msg.text());
      }
    });
    
    // Monitor script loading
    page.on('response', async response => {
      if (response.url().includes('.js')) {
        results.scriptLoadTimes.push({
          url: response.url(),
          status: response.status(),
          loadTime: Date.now()
        });
      }
    });
    
    try {
      await page.goto('https://tetrixcorp.com/');
      await page.waitForLoadState('networkidle');
      
      // Check function availability
      const functions = await page.evaluate(() => {
        return {
          openIndustryAuthModal: typeof window.openIndustryAuthModal,
          open2FAModal: typeof window.open2FAModal,
          openClientLogin: typeof window.openClientLogin,
          tetrixAuthContext: typeof window.tetrixAuthContext,
          dashboardRoutingService: typeof window.dashboardRoutingService
        };
      });
      
      results.functionAvailability.push(functions);
      
      // Test Client Login button
      const clientLoginBtn = page.locator('#client-login-2fa-btn');
      await expect(clientLoginBtn).toBeVisible();
      
      await clientLoginBtn.click();
      await page.waitForTimeout(2000);
      
      // Check if modal opened
      const isModalVisible = await page.evaluate(() => {
        const modal = document.getElementById('industry-auth-modal');
        return modal && !modal.classList.contains('hidden');
      });
      
      results.success = isModalVisible;
      console.log(`✅ [CUSTOM] Authentication test result: ${isModalVisible}`);
      
    } catch (error) {
      console.log(`❌ [CUSTOM] Error: ${error.message}`);
      results.errors.push(error.message);
    }
    
    customDomainResults = results;
    console.log('📊 [CUSTOM] Results captured:', results);
  });

  test('should compare results and identify differences', async ({ page }) => {
    console.log('🔍 [COMPARISON] Comparing results...');
    
    const comparison = {
      production: productionResults,
      customDomain: customDomainResults,
      differences: {
        scriptLoadTimes: [],
        functionAvailability: [],
        consoleLogs: [],
        errors: [],
        success: {
          production: productionResults.success,
          customDomain: customDomainResults.success
        }
      }
    };
    
    // Compare script load times
    const productionScripts = productionResults.scriptLoadTimes.map(s => s.url);
    const customScripts = customDomainResults.scriptLoadTimes.map(s => s.url);
    
    comparison.differences.scriptLoadTimes = {
      productionOnly: productionScripts.filter(url => !customScripts.includes(url)),
      customOnly: customScripts.filter(url => !productionScripts.includes(url)),
      common: productionScripts.filter(url => customScripts.includes(url))
    };
    
    // Compare function availability
    if (productionResults.functionAvailability.length > 0 && customDomainResults.functionAvailability.length > 0) {
      const prodFunctions = productionResults.functionAvailability[0];
      const customFunctions = customDomainResults.functionAvailability[0];
      
      comparison.differences.functionAvailability = {
        production: prodFunctions,
        customDomain: customFunctions,
        differences: Object.keys(prodFunctions).filter(key => 
          prodFunctions[key] !== customFunctions[key]
        )
      };
    }
    
    // Compare console logs
    const productionLogs = productionResults.consoleLogs.map(log => log.text);
    const customLogs = customDomainResults.consoleLogs.map(log => log.text);
    
    comparison.differences.consoleLogs = {
      productionOnly: productionLogs.filter(log => !customLogs.includes(log)),
      customOnly: customLogs.filter(log => !productionLogs.includes(log)),
      common: productionLogs.filter(log => customLogs.includes(log))
    };
    
    // Compare errors
    comparison.differences.errors = {
      production: productionResults.errors,
      customDomain: customDomainResults.errors
    };
    
    console.log('📊 [COMPARISON] Detailed comparison:', JSON.stringify(comparison, null, 2));
    
    // Export results
    const fs = require('fs');
    fs.writeFileSync('authentication-comparison-results.json', JSON.stringify(comparison, null, 2));
    console.log('📁 [COMPARISON] Results exported to authentication-comparison-results.json');
    
    // Summary
    console.log('📋 [COMPARISON] Summary:');
    console.log(`  Production URL success: ${productionResults.success}`);
    console.log(`  Custom Domain success: ${customDomainResults.success}`);
    console.log(`  Script differences: ${comparison.differences.scriptLoadTimes.productionOnly.length} production-only, ${comparison.differences.scriptLoadTimes.customOnly.length} custom-only`);
    console.log(`  Function differences: ${comparison.differences.functionAvailability.differences?.length || 0} different functions`);
    console.log(`  Console log differences: ${comparison.differences.consoleLogs.productionOnly.length} production-only, ${comparison.differences.consoleLogs.customOnly.length} custom-only`);
    console.log(`  Error differences: ${productionResults.errors.length} production errors, ${customDomainResults.errors.length} custom domain errors`);
  });
});
