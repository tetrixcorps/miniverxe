import { test, expect } from '@playwright/test';

test.describe('TETRIX Main Site E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up any common configurations
    await page.goto('/');
  });

  test.describe('Homepage', () => {
    test('should display homepage correctly', async ({ page }) => {
      await expect(page).toHaveTitle(/TETRIX/);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();
    });

    test('should have functional navigation menu', async ({ page }) => {
      const navLinks = [
        { text: 'Home', href: '/' },
        { text: 'About', href: '/about' },
        { text: 'Solutions', href: '/solutions' },
        { text: 'Services', href: '/services' },
        { text: 'Contact', href: '/contact' },
      ];

      for (const link of navLinks) {
        const navLink = page.locator('nav a', { hasText: link.text });
        await expect(navLink).toBeVisible();
        await expect(navLink).toHaveAttribute('href', link.href);
      }
    });

    test('should have responsive design', async ({ page }) => {
      // Test desktop view
      await page.setViewportSize({ width: 1200, height: 800 });
      await expect(page.locator('nav')).toBeVisible();
      
      // Test mobile view
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('nav')).toBeVisible();
    });

    test('should have animated logo', async ({ page }) => {
      const logo = page.locator('svg[class*="logo"], .logo svg');
      await expect(logo).toBeVisible();
    });
  });

  test.describe('About Page', () => {
    test('should navigate to about page', async ({ page }) => {
      await page.click('nav a[href="/about"]');
      await expect(page).toHaveURL('/about');
      await expect(page.locator('h1')).toContainText(/about/i);
    });

    test('should display company information', async ({ page }) => {
      await page.goto('/about');
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('h1')).toBeVisible();
    });
  });

  test.describe('Solutions Page', () => {
    test('should navigate to solutions page', async ({ page }) => {
      await page.click('nav a[href="/solutions"]');
      await expect(page).toHaveURL('/solutions');
      await expect(page.locator('h1')).toContainText(/solutions/i);
    });

    test('should display solution features', async ({ page }) => {
      await page.goto('/solutions');
      await expect(page.locator('main')).toBeVisible();
      
      // Look for feature cards or sections
      const featureCards = page.locator('[class*="feature"], .feature-card, [class*="card"]');
      if (await featureCards.count() > 0) {
        await expect(featureCards.first()).toBeVisible();
      }
    });
  });

  test.describe('Services Page', () => {
    test('should navigate to services page', async ({ page }) => {
      await page.click('nav a[href="/services"]');
      await expect(page).toHaveURL('/services');
      await expect(page.locator('h1')).toContainText(/services/i);
    });

    test('should display service offerings', async ({ page }) => {
      await page.goto('/services');
      await expect(page.locator('main')).toBeVisible();
      
      // Look for service cards or sections
      const serviceCards = page.locator('[class*="service"], .service-card, [class*="card"]');
      if (await serviceCards.count() > 0) {
        await expect(serviceCards.first()).toBeVisible();
      }
    });
  });

  test.describe('Pricing Page', () => {
    test('should navigate to pricing page', async ({ page }) => {
      await page.goto('/pricing');
      await expect(page).toHaveURL('/pricing');
      await expect(page.locator('h1')).toContainText(/pricing/i);
    });

    test('should display pricing plans', async ({ page }) => {
      await page.goto('/pricing');
      await expect(page.locator('main')).toBeVisible();
      
      // Look for pricing cards or plans
      const pricingCards = page.locator('[class*="pricing"], .pricing-card, [class*="plan"]');
      if (await pricingCards.count() > 0) {
        await expect(pricingCards.first()).toBeVisible();
      }
    });
  });

  test.describe('Contact Page', () => {
    test('should navigate to contact page', async ({ page }) => {
      await page.click('nav a[href="/contact"]');
      await expect(page).toHaveURL('/contact');
      await expect(page.locator('h1')).toContainText(/contact/i);
    });

    test('should display contact form', async ({ page }) => {
      await page.goto('/contact');
      
      // Check for form elements
      await expect(page.locator('form')).toBeVisible();
      await expect(page.locator('input[name="name"], input[type="text"]')).toBeVisible();
      await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible();
      await expect(page.locator('textarea[name="message"], textarea')).toBeVisible();
      await expect(page.locator('button[type="submit"], input[type="submit"]')).toBeVisible();
    });

    test('should submit contact form successfully', async ({ page }) => {
      await page.goto('/contact');
      
      // Fill out the form
      await page.fill('input[name="name"], input[type="text"]', 'John Doe');
      await page.fill('input[name="email"], input[type="email"]', 'john@example.com');
      await page.fill('textarea[name="message"], textarea', 'This is a test message for E2E testing.');
      
      // Submit the form
      await page.click('button[type="submit"], input[type="submit"]');
      
      // Check for success message or redirect
      await expect(page.locator('text=/success|thank you|sent/i')).toBeVisible({ timeout: 10000 });
    });

    test('should show validation errors for empty form', async ({ page }) => {
      await page.goto('/contact');
      
      // Try to submit empty form
      await page.click('button[type="submit"], input[type="submit"]');
      
      // Check for validation messages
      const nameInput = page.locator('input[name="name"], input[type="text"]');
      const emailInput = page.locator('input[name="email"], input[type="email"]');
      const messageInput = page.locator('textarea[name="message"], textarea');
      
      await expect(nameInput).toHaveAttribute('required');
      await expect(emailInput).toHaveAttribute('required');
      await expect(messageInput).toHaveAttribute('required');
    });
  });

  test.describe('SEO and Performance', () => {
    test('should have proper meta tags', async ({ page }) => {
      await page.goto('/');
      
      // Check for essential meta tags
      await expect(page.locator('meta[name="description"]')).toHaveCount(1);
      await expect(page.locator('meta[name="viewport"]')).toHaveCount(1);
      await expect(page.locator('title')).toHaveText(/TETRIX/);
    });

    test('should load quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      const loadTime = Date.now() - startTime;
      
      // Page should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading structure', async ({ page }) => {
      await page.goto('/');
      
      // Check for h1 tag
      await expect(page.locator('h1')).toHaveCount(1);
      
      // Check for logical heading hierarchy
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
      expect(headings.length).toBeGreaterThan(0);
    });

    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/');
      
      // Tab through navigation links
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
      
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
    });
  });
});