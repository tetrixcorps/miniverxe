import { test, expect } from '@playwright/test';

test.describe('Check JavaScript Execution Test', () => {
  test('should check if header-auth.js is executing on custom domain', async ({ page }) => {
    console.log('🌐 Testing JavaScript execution on custom domain...');
    
    // Capture all console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      console.log(`📝 Console: ${text}`);
    });
    
    // Navigate to custom domain
    await page.goto('https://tetrixcorp.com');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if header-auth.js debugging logs appear
    const headerAuthLogs = consoleLogs.filter(log => log.includes('🔧 header-auth.js'));
    console.log(`🔍 Header-auth.js logs found: ${headerAuthLogs.length}`);
    
    if (headerAuthLogs.length > 0) {
      console.log('✅ header-auth.js is executing on custom domain');
      headerAuthLogs.forEach(log => console.log(`  - ${log}`));
    } else {
      console.log('❌ header-auth.js is NOT executing on custom domain');
    }
    
    // Check if the file is being loaded
    const scriptTags = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      return scripts.map(script => script.getAttribute('src')).filter(src => src?.includes('header-auth'));
    });
    
    console.log('🔍 Script tags with header-auth:', scriptTags);
    
    // Check if there are any JavaScript errors
    const jsErrors = consoleLogs.filter(log => log.includes('Error') || log.includes('error'));
    if (jsErrors.length > 0) {
      console.log('❌ JavaScript errors found:');
      jsErrors.forEach(error => console.log(`  - ${error}`));
    }
    
    // Check if the Client Login button exists
    const clientLoginButton = page.locator('#client-login-2fa-btn');
    const buttonExists = await clientLoginButton.count() > 0;
    console.log(`🔍 Client Login button exists: ${buttonExists}`);
    
    // Try to manually execute the header-auth.js logic
    console.log('🔧 Manually executing header-auth.js logic...');
    await page.evaluate(() => {
      console.log('🔧 Manual execution: Looking for Client Login button...');
      const clientLoginBtn = document.getElementById('client-login-2fa-btn');
      if (clientLoginBtn) {
        console.log('🔧 Manual execution: Button found, adding event listener...');
        clientLoginBtn.addEventListener('click', function (e) {
          console.log('🔧 Manual execution: Button clicked!');
          e.preventDefault();
          if (window.openIndustryAuthModal) {
            window.openIndustryAuthModal();
          }
        });
        console.log('🔧 Manual execution: Event listener added successfully');
      } else {
        console.log('❌ Manual execution: Button not found');
      }
    });
    
    // Now try clicking the button
    console.log('🖱️ Clicking button after manual setup...');
    await clientLoginButton.click();
    
    // Wait for modal
    await page.waitForTimeout(2000);
    
    // Check if modal opened
    const industryAuthModal = page.locator('#industry-auth-modal');
    const isVisible = await industryAuthModal.isVisible();
    
    console.log(`🔍 Industry Auth modal visible after manual setup: ${isVisible}`);
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/check-js-execution.png' });
    console.log('📸 Screenshot saved to test-results/check-js-execution.png');
  });
});

