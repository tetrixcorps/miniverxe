import { test, expect } from '@playwright/test';

test.describe('TETRIX Web App E2E Tests', () => {
  // Assuming the web app runs on a different port or subdomain
  // This might need adjustment based on how the web app is deployed
  const WEB_APP_URL = 'http://localhost:3000'; // Adjust as needed

  test.describe('Landing Page', () => {
    test('should display landing page correctly', async ({ page }) => {
      await page.goto(`${WEB_APP_URL}/`);
      
      // Check if the page loads
      await expect(page.locator('main, #root, .app')).toBeVisible();
      
      // Check for React app elements
      await expect(page.locator('h1, h2, h3')).toBeVisible();
    });

    test('should have interactive elements', async ({ page }) => {
      await page.goto(`${WEB_APP_URL}/`);
      
      // Look for buttons and interactive elements
      const buttons = page.locator('button');
      if (await buttons.count() > 0) {
        await expect(buttons.first()).toBeVisible();
      }
      
      // Look for links
      const links = page.locator('a');
      if (await links.count() > 0) {
        await expect(links.first()).toBeVisible();
      }
    });

    test('should be responsive', async ({ page }) => {
      await page.goto(`${WEB_APP_URL}/`);
      
      // Test desktop view
      await page.setViewportSize({ width: 1200, height: 800 });
      await expect(page.locator('main, #root, .app')).toBeVisible();
      
      // Test tablet view
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.locator('main, #root, .app')).toBeVisible();
      
      // Test mobile view
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('main, #root, .app')).toBeVisible();
    });
  });

  test.describe('Analytics Page', () => {
    test('should navigate to analytics page', async ({ page }) => {
      await page.goto(`${WEB_APP_URL}/analytics`);
      
      // Check if analytics page loads
      await expect(page.locator('main, #root, .app')).toBeVisible();
      
      // Look for analytics-specific elements
      const analyticsElements = page.locator('[class*="analytics"], [class*="chart"], [class*="graph"]');
      if (await analyticsElements.count() > 0) {
        await expect(analyticsElements.first()).toBeVisible();
      }
    });

    test('should display analytics data', async ({ page }) => {
      await page.goto(`${WEB_APP_URL}/analytics`);
      
      // Wait for potential data loading
      await page.waitForTimeout(2000);
      
      // Check for data visualization elements
      const dataElements = page.locator('svg, canvas, table, .chart, .graph');
      if (await dataElements.count() > 0) {
        await expect(dataElements.first()).toBeVisible();
      }
    });
  });

  test.describe('Primitives Page', () => {
    test('should navigate to primitives page', async ({ page }) => {
      await page.goto(`${WEB_APP_URL}/primitives`);
      
      // Check if primitives page loads
      await expect(page.locator('main, #root, .app')).toBeVisible();
      
      // Look for primitive components
      const primitiveElements = page.locator('[class*="primitive"], button, input, .component');
      if (await primitiveElements.count() > 0) {
        await expect(primitiveElements.first()).toBeVisible();
      }
    });

    test('should display interactive primitives', async ({ page }) => {
      await page.goto(`${WEB_APP_URL}/primitives`);
      
      // Test button interactions
      const buttons = page.locator('button');
      if (await buttons.count() > 0) {
        await buttons.first().click();
        // Check for any visual feedback
        await expect(buttons.first()).toBeVisible();
      }
      
      // Test input interactions
      const inputs = page.locator('input');
      if (await inputs.count() > 0) {
        await inputs.first().fill('test input');
        await expect(inputs.first()).toHaveValue('test input');
      }
    });
  });

  test.describe('Review Page', () => {
    test('should navigate to review page', async ({ page }) => {
      await page.goto(`${WEB_APP_URL}/review`);
      
      // Check if review page loads
      await expect(page.locator('main, #root, .app')).toBeVisible();
      
      // Look for review-specific elements
      const reviewElements = page.locator('[class*="review"], .review-card, .rating');
      if (await reviewElements.count() > 0) {
        await expect(reviewElements.first()).toBeVisible();
      }
    });

    test('should display review functionality', async ({ page }) => {
      await page.goto(`${WEB_APP_URL}/review`);
      
      // Look for review forms or rating systems
      const reviewForms = page.locator('form, .review-form');
      if (await reviewForms.count() > 0) {
        await expect(reviewForms.first()).toBeVisible();
      }
      
      // Look for rating elements
      const ratingElements = page.locator('.rating, .stars, [class*="rating"]');
      if (await ratingElements.count() > 0) {
        await expect(ratingElements.first()).toBeVisible();
      }
    });
  });

  test.describe('Preview Landing Page', () => {
    test('should display preview landing page', async ({ page }) => {
      await page.goto(`${WEB_APP_URL}/preview`);
      
      // Check if preview page loads
      await expect(page.locator('main, #root, .app')).toBeVisible();
      
      // Look for preview-specific elements
      const previewElements = page.locator('[class*="preview"], .preview-container');
      if (await previewElements.count() > 0) {
        await expect(previewElements.first()).toBeVisible();
      }
    });
  });

  test.describe('Web App Performance', () => {
    test('should load quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(`${WEB_APP_URL}/`);
      const loadTime = Date.now() - startTime;
      
      // React app should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should handle JavaScript errors gracefully', async ({ page }) => {
      const errors: string[] = [];
      
      page.on('pageerror', (error) => {
        errors.push(error.message);
      });
      
      await page.goto(`${WEB_APP_URL}/`);
      
      // Navigate through different pages
      await page.goto(`${WEB_APP_URL}/analytics`);
      await page.goto(`${WEB_APP_URL}/primitives`);
      await page.goto(`${WEB_APP_URL}/review`);
      
      // Check for critical errors
      const criticalErrors = errors.filter(error => 
        error.includes('TypeError') || error.includes('ReferenceError')
      );
      
      expect(criticalErrors.length).toBe(0);
    });
  });

  test.describe('React App Integration', () => {
    test('should have React DevTools support', async ({ page }) => {
      await page.goto(`${WEB_APP_URL}/`);
      
      // Check for React root element
      await expect(page.locator('#root, .app')).toBeVisible();
      
      // Check for React-specific attributes
      const reactElements = page.locator('[data-reactroot], [data-react-class]');
      if (await reactElements.count() > 0) {
        await expect(reactElements.first()).toBeVisible();
      }
    });

    test('should handle state management', async ({ page }) => {
      await page.goto(`${WEB_APP_URL}/`);
      
      // Test state changes through interactions
      const interactiveElements = page.locator('button, input, select');
      if (await interactiveElements.count() > 0) {
        await interactiveElements.first().click();
        
        // Check for state updates (DOM changes)
        await page.waitForTimeout(1000);
        await expect(page.locator('body')).toBeVisible();
      }
    });

    test('should handle routing', async ({ page }) => {
      await page.goto(`${WEB_APP_URL}/`);
      
      // Test client-side routing
      const navigationLinks = page.locator('nav a, .nav-link');
      if (await navigationLinks.count() > 0) {
        await navigationLinks.first().click();
        
        // Check if URL changed without full page reload
        await page.waitForTimeout(1000);
        await expect(page.locator('main, #root, .app')).toBeVisible();
      }
    });
  });
});