import { test, expect } from '@playwright/test';

test.describe('TETRIX Visual Regression Tests', () => {
  test.describe('Homepage Visual Tests', () => {
    test('should match homepage desktop layout', async ({ page }) => {
      await page.goto('/');
      await page.setViewportSize({ width: 1200, height: 800 });
      
      // Wait for any animations or loading to complete
      await page.waitForTimeout(2000);
      
      // Take screenshot of the full page
      await expect(page).toHaveScreenshot('homepage-desktop.png', {
        fullPage: true,
        threshold: 0.2,
      });
    });

    test('should match homepage mobile layout', async ({ page }) => {
      await page.goto('/');
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Wait for any animations or loading to complete
      await page.waitForTimeout(2000);
      
      // Take screenshot of the full page
      await expect(page).toHaveScreenshot('homepage-mobile.png', {
        fullPage: true,
        threshold: 0.2,
      });
    });

    test('should match homepage tablet layout', async ({ page }) => {
      await page.goto('/');
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Wait for any animations or loading to complete
      await page.waitForTimeout(2000);
      
      // Take screenshot of the full page
      await expect(page).toHaveScreenshot('homepage-tablet.png', {
        fullPage: true,
        threshold: 0.2,
      });
    });
  });

  test.describe('Navigation Visual Tests', () => {
    test('should match navigation desktop layout', async ({ page }) => {
      await page.goto('/');
      await page.setViewportSize({ width: 1200, height: 800 });
      
      // Take screenshot of just the navigation
      await expect(page.locator('nav')).toHaveScreenshot('navigation-desktop.png', {
        threshold: 0.2,
      });
    });

    test('should match navigation mobile layout', async ({ page }) => {
      await page.goto('/');
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Take screenshot of just the navigation
      await expect(page.locator('nav')).toHaveScreenshot('navigation-mobile.png', {
        threshold: 0.2,
      });
    });

    test('should match navigation hover states', async ({ page }) => {
      await page.goto('/');
      await page.setViewportSize({ width: 1200, height: 800 });
      
      // Hover over navigation items
      const navLinks = page.locator('nav a');
      if (await navLinks.count() > 0) {
        await navLinks.first().hover();
        await page.waitForTimeout(500);
        
        await expect(page.locator('nav')).toHaveScreenshot('navigation-hover.png', {
          threshold: 0.2,
        });
      }
    });
  });

  test.describe('Logo Visual Tests', () => {
    test('should match logo appearance', async ({ page }) => {
      await page.goto('/');
      
      // Wait for logo animation to complete
      await page.waitForTimeout(3000);
      
      const logo = page.locator('svg[class*="logo"], .logo svg, .logo');
      if (await logo.count() > 0) {
        await expect(logo.first()).toHaveScreenshot('logo.png', {
          threshold: 0.2,
        });
      }
    });

    test('should match logo animation states', async ({ page }) => {
      await page.goto('/');
      
      // Capture logo at different animation states
      const logo = page.locator('svg[class*="logo"], .logo svg, .logo');
      if (await logo.count() > 0) {
        // Initial state
        await expect(logo.first()).toHaveScreenshot('logo-initial.png', {
          threshold: 0.2,
        });
        
        // Wait for animation
        await page.waitForTimeout(1500);
        await expect(logo.first()).toHaveScreenshot('logo-animated.png', {
          threshold: 0.2,
        });
      }
    });
  });

  test.describe('Form Visual Tests', () => {
    test('should match contact form desktop layout', async ({ page }) => {
      await page.goto('/contact');
      await page.setViewportSize({ width: 1200, height: 800 });
      
      // Wait for form to load
      await page.waitForTimeout(1000);
      
      const form = page.locator('form');
      if (await form.count() > 0) {
        await expect(form.first()).toHaveScreenshot('contact-form-desktop.png', {
          threshold: 0.2,
        });
      }
    });

    test('should match contact form mobile layout', async ({ page }) => {
      await page.goto('/contact');
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Wait for form to load
      await page.waitForTimeout(1000);
      
      const form = page.locator('form');
      if (await form.count() > 0) {
        await expect(form.first()).toHaveScreenshot('contact-form-mobile.png', {
          threshold: 0.2,
        });
      }
    });

    test('should match form focus states', async ({ page }) => {
      await page.goto('/contact');
      await page.setViewportSize({ width: 1200, height: 800 });
      
      // Focus on form fields
      const nameInput = page.locator('input[name="name"], input[type="text"]');
      if (await nameInput.count() > 0) {
        await nameInput.focus();
        await page.waitForTimeout(500);
        
        const form = page.locator('form');
        await expect(form.first()).toHaveScreenshot('contact-form-focus.png', {
          threshold: 0.2,
        });
      }
    });
  });

  test.describe('Page Layout Visual Tests', () => {
    const pages = [
      { url: '/about', name: 'about' },
      { url: '/solutions', name: 'solutions' },
      { url: '/services', name: 'services' },
      { url: '/pricing', name: 'pricing' },
    ];

    for (const pageInfo of pages) {
      test(`should match ${pageInfo.name} page desktop layout`, async ({ page }) => {
        await page.goto(pageInfo.url);
        await page.setViewportSize({ width: 1200, height: 800 });
        
        // Wait for page to load
        await page.waitForTimeout(2000);
        
        await expect(page).toHaveScreenshot(`${pageInfo.name}-desktop.png`, {
          fullPage: true,
          threshold: 0.2,
        });
      });

      test(`should match ${pageInfo.name} page mobile layout`, async ({ page }) => {
        await page.goto(pageInfo.url);
        await page.setViewportSize({ width: 375, height: 667 });
        
        // Wait for page to load
        await page.waitForTimeout(2000);
        
        await expect(page).toHaveScreenshot(`${pageInfo.name}-mobile.png`, {
          fullPage: true,
          threshold: 0.2,
        });
      });
    }
  });

  test.describe('Component Visual Tests', () => {
    test('should match feature cards appearance', async ({ page }) => {
      await page.goto('/solutions');
      
      // Wait for components to load
      await page.waitForTimeout(2000);
      
      const featureCards = page.locator('[class*="feature"], .feature-card, [class*="card"]');
      if (await featureCards.count() > 0) {
        await expect(featureCards.first()).toHaveScreenshot('feature-card.png', {
          threshold: 0.2,
        });
      }
    });

    test('should match pricing cards appearance', async ({ page }) => {
      await page.goto('/pricing');
      
      // Wait for components to load
      await page.waitForTimeout(2000);
      
      const pricingCards = page.locator('[class*="pricing"], .pricing-card, [class*="plan"]');
      if (await pricingCards.count() > 0) {
        await expect(pricingCards.first()).toHaveScreenshot('pricing-card.png', {
          threshold: 0.2,
        });
      }
    });

    test('should match service cards appearance', async ({ page }) => {
      await page.goto('/services');
      
      // Wait for components to load
      await page.waitForTimeout(2000);
      
      const serviceCards = page.locator('[class*="service"], .service-card, [class*="card"]');
      if (await serviceCards.count() > 0) {
        await expect(serviceCards.first()).toHaveScreenshot('service-card.png', {
          threshold: 0.2,
        });
      }
    });
  });

  test.describe('Admin Visual Tests', () => {
    test('should match admin login page layout', async ({ page }) => {
      await page.goto('/admin');
      
      // Wait for page to load
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('admin-login.png', {
        fullPage: true,
        threshold: 0.2,
      });
    });

    test('should match admin form elements', async ({ page }) => {
      await page.goto('/admin/login');
      
      // Wait for form to load
      await page.waitForTimeout(1000);
      
      const loginForm = page.locator('form, .login-form');
      if (await loginForm.count() > 0) {
        await expect(loginForm.first()).toHaveScreenshot('admin-login-form.png', {
          threshold: 0.2,
        });
      }
    });
  });

  test.describe('Dark Mode Visual Tests', () => {
    test('should match dark mode if supported', async ({ page }) => {
      await page.goto('/');
      
      // Check if dark mode is supported
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
      });
      
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('homepage-dark-mode.png', {
        fullPage: true,
        threshold: 0.2,
      });
    });
  });

  test.describe('Color Scheme Visual Tests', () => {
    test('should match fiery red color scheme', async ({ page }) => {
      await page.goto('/');
      
      // Wait for styling to load
      await page.waitForTimeout(2000);
      
      // Check for specific color scheme elements
      const colorElements = page.locator('button, .btn, .primary, .accent');
      if (await colorElements.count() > 0) {
        await expect(colorElements.first()).toHaveScreenshot('color-scheme-primary.png', {
          threshold: 0.2,
        });
      }
    });
  });
});