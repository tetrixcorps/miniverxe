import { test, expect, Page } from '@playwright/test';

test.describe('Authentication Button Domain Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Enable network monitoring
    await page.route('**/*', (route) => {
      console.log(`Network request: ${route.request().method()} ${route.request().url()}`);
      route.continue();
    });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('Code Academy button should redirect to poisonedreligion.ai', async () => {
    // Navigate to the landing page
    await page.goto('http://localhost:8084');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find the Code Academy button
    const codeAcademyBtn = page.locator('#open-code-academy-modal');
    await expect(codeAcademyBtn).toBeVisible();
    
    // Monitor network requests for external redirects
    const requests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('poisonedreligion.ai') || request.url().includes('joromi.ai')) {
        requests.push(request.url());
        console.log(`External redirect detected: ${request.url()}`);
      }
    });

    // Click the Code Academy button
    await codeAcademyBtn.click();
    
    // Wait for potential redirects
    await page.waitForTimeout(3000);
    
    // Check if any external requests were made
    console.log('External requests made:', requests);
    
    // Check if window.open was called (fallback behavior)
    const newPagePromise = page.waitForEvent('popup');
    await codeAcademyBtn.click();
    
    try {
      const newPage = await newPagePromise;
      await newPage.waitForLoadState('networkidle');
      
      const url = newPage.url();
      console.log('New page URL:', url);
      
      // Check if the URL contains the expected domain
      expect(url).toContain('poisonedreligion.ai');
      
      await newPage.close();
    } catch (error) {
      console.log('No popup opened, checking for direct navigation');
    }
  });

  test('JoRoMi button should redirect to joromi.ai', async () => {
    // Navigate to the landing page
    await page.goto('http://localhost:8084');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find the JoRoMi button
    const joromiBtn = page.locator('#joromi-2fa-btn');
    await expect(joromiBtn).toBeVisible();
    
    // Monitor network requests for external redirects
    const requests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('joromi.ai') || request.url().includes('poisonedreligion.ai')) {
        requests.push(request.url());
        console.log(`External redirect detected: ${request.url()}`);
      }
    });

    // Click the JoRoMi button
    await joromiBtn.click();
    
    // Wait for potential redirects
    await page.waitForTimeout(3000);
    
    // Check if any external requests were made
    console.log('External requests made:', requests);
    
    // Check if window.open was called (fallback behavior)
    const newPagePromise = page.waitForEvent('popup');
    await joromiBtn.click();
    
    try {
      const newPage = await newPagePromise;
      await newPage.waitForLoadState('networkidle');
      
      const url = newPage.url();
      console.log('New page URL:', url);
      
      // Check if the URL contains the expected domain
      expect(url).toContain('joromi.ai');
      
      await newPage.close();
    } catch (error) {
      console.log('No popup opened, checking for direct navigation');
    }
  });

  test('Test domain reachability directly', async () => {
    // Test poisonedreligion.ai reachability
    console.log('Testing poisonedreligion.ai reachability...');
    try {
      const response = await page.goto('https://www.poisonedreligion.ai', { 
        waitUntil: 'networkidle',
        timeout: 10000 
      });
      console.log('poisonedreligion.ai response status:', response?.status());
      expect(response?.status()).toBe(200);
    } catch (error) {
      console.log('poisonedreligion.ai error:', error);
    }

    // Test joromi.ai reachability
    console.log('Testing joromi.ai reachability...');
    try {
      const response = await page.goto('https://www.joromi.ai', { 
        waitUntil: 'networkidle',
        timeout: 10000 
      });
      console.log('joromi.ai response status:', response?.status());
      expect(response?.status()).toBe(200);
    } catch (error) {
      console.log('joromi.ai error:', error);
    }
  });

  test('Test seamless transition functionality', async () => {
    // Navigate to the landing page
    await page.goto('http://localhost:8084');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if seamless transition functions are available
    const redirectToExternal = await page.evaluate(() => {
      return typeof (window as any).redirectToExternal === 'function';
    });
    
    const redirectToInternal = await page.evaluate(() => {
      return typeof (window as any).redirectToInternal === 'function';
    });
    
    console.log('redirectToExternal available:', redirectToExternal);
    console.log('redirectToInternal available:', redirectToInternal);
    
    expect(redirectToExternal).toBe(true);
    expect(redirectToInternal).toBe(true);
    
    // Test the seamless transition overlay
    const overlay = page.locator('#seamless-transition-overlay');
    await expect(overlay).toBeAttached();
    
    // Test Code Academy transition
    await page.evaluate(() => {
      (window as any).redirectToExternal('code-academy');
    });
    
    // Check if overlay is shown
    await page.waitForTimeout(1000);
    const isOverlayVisible = await overlay.isVisible();
    console.log('Transition overlay visible:', isOverlayVisible);
    
    // Test JoRoMi transition
    await page.evaluate(() => {
      (window as any).redirectToExternal('joromi');
    });
    
    await page.waitForTimeout(1000);
    const isOverlayVisible2 = await overlay.isVisible();
    console.log('Transition overlay visible for JoRoMi:', isOverlayVisible2);
  });

  test('Test button click handlers and console errors', async () => {
    // Navigate to the landing page
    await page.goto('http://localhost:8084');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Monitor console errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('Console error:', msg.text());
      }
    });
    
    // Test Code Academy button click
    const codeAcademyBtn = page.locator('#open-code-academy-modal');
    await codeAcademyBtn.click();
    
    // Wait for any async operations
    await page.waitForTimeout(2000);
    
    // Test JoRoMi button click
    const joromiBtn = page.locator('#joromi-2fa-btn');
    await joromiBtn.click();
    
    // Wait for any async operations
    await page.waitForTimeout(2000);
    
    console.log('Console errors during button clicks:', consoleErrors);
    
    // Check for specific error patterns
    const domainErrors = consoleErrors.filter(error => 
      error.includes('poisonedreligion.ai') || 
      error.includes('joromi.ai') ||
      error.includes('DNS') ||
      error.includes('network') ||
      error.includes('fetch')
    );
    
    console.log('Domain-related errors:', domainErrors);
  });

  test('Test mobile button functionality', async () => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to the landing page
    await page.goto('http://localhost:8084');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Open mobile menu
    const mobileMenuBtn = page.locator('#mobile-menu-btn');
    await mobileMenuBtn.click();
    
    // Wait for mobile menu to appear
    await page.waitForTimeout(500);
    
    // Test mobile Code Academy button
    const mobileCodeAcademyBtn = page.locator('#open-code-academy-modal-mobile');
    await expect(mobileCodeAcademyBtn).toBeVisible();
    
    // Monitor for popup
    const newPagePromise = page.waitForEvent('popup');
    await mobileCodeAcademyBtn.click();
    
    try {
      const newPage = await newPagePromise;
      await newPage.waitForLoadState('networkidle');
      const url = newPage.url();
      console.log('Mobile Code Academy redirect URL:', url);
      await newPage.close();
    } catch (error) {
      console.log('Mobile Code Academy - No popup opened');
    }
    
    // Test mobile JoRoMi button
    const mobileJoromiBtn = page.locator('#joromi-2fa-btn-mobile');
    await expect(mobileJoromiBtn).toBeVisible();
    
    const newPagePromise2 = page.waitForEvent('popup');
    await mobileJoromiBtn.click();
    
    try {
      const newPage = await newPagePromise2;
      await newPage.waitForLoadState('networkidle');
      const url = newPage.url();
      console.log('Mobile JoRoMi redirect URL:', url);
      await newPage.close();
    } catch (error) {
      console.log('Mobile JoRoMi - No popup opened');
    }
  });
});

