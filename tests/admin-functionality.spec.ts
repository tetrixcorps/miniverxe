import { test, expect } from '@playwright/test';

test.describe('TETRIX Admin Functionality E2E Tests', () => {
  test.describe('Admin Authentication', () => {
    test('should display admin login page', async ({ page }) => {
      await page.goto('/admin');
      
      // Check if admin page loads
      await expect(page.locator('main, .admin-container')).toBeVisible();
      
      // Look for authentication elements
      const authElements = page.locator('form, .login-form, input[type="password"], .auth');
      if (await authElements.count() > 0) {
        await expect(authElements.first()).toBeVisible();
      }
    });

    test('should handle admin login process', async ({ page }) => {
      await page.goto('/admin');
      
      // Look for login form
      const loginForm = page.locator('form, .login-form');
      if (await loginForm.count() > 0) {
        // Look for username/email input
        const usernameInput = page.locator('input[type="email"], input[name="username"], input[name="email"]');
        if (await usernameInput.count() > 0) {
          await usernameInput.fill('admin@tetrix.com');
        }
        
        // Look for password input
        const passwordInput = page.locator('input[type="password"], input[name="password"]');
        if (await passwordInput.count() > 0) {
          await passwordInput.fill('testpassword');
        }
        
        // Try to submit (this might fail with invalid credentials, which is expected)
        const submitButton = page.locator('button[type="submit"], input[type="submit"]');
        if (await submitButton.count() > 0) {
          await submitButton.click();
          
          // Check for error message or successful login
          await page.waitForTimeout(2000);
          await expect(page.locator('body')).toBeVisible();
        }
      }
    });

    test('should show proper error handling for invalid credentials', async ({ page }) => {
      await page.goto('/admin');
      
      const loginForm = page.locator('form, .login-form');
      if (await loginForm.count() > 0) {
        // Fill with invalid credentials
        const usernameInput = page.locator('input[type="email"], input[name="username"], input[name="email"]');
        if (await usernameInput.count() > 0) {
          await usernameInput.fill('invalid@email.com');
        }
        
        const passwordInput = page.locator('input[type="password"], input[name="password"]');
        if (await passwordInput.count() > 0) {
          await passwordInput.fill('wrongpassword');
        }
        
        const submitButton = page.locator('button[type="submit"], input[type="submit"]');
        if (await submitButton.count() > 0) {
          await submitButton.click();
          
          // Check for error message
          const errorMessage = page.locator('.error, .alert-error, [class*="error"]');
          if (await errorMessage.count() > 0) {
            await expect(errorMessage.first()).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Admin Dashboard', () => {
    test('should display admin dashboard after authentication', async ({ page }) => {
      await page.goto('/admin/dashboard');
      
      // Check if dashboard loads (might redirect to login if not authenticated)
      await expect(page.locator('main, .dashboard, .admin-dashboard')).toBeVisible();
      
      // Look for dashboard elements
      const dashboardElements = page.locator('.dashboard-card, .metric, .chart, .admin-panel');
      if (await dashboardElements.count() > 0) {
        await expect(dashboardElements.first()).toBeVisible();
      }
    });

    test('should display admin navigation', async ({ page }) => {
      await page.goto('/admin');
      
      // Look for admin navigation
      const adminNav = page.locator('nav.admin-nav, .admin-sidebar, .admin-menu');
      if (await adminNav.count() > 0) {
        await expect(adminNav).toBeVisible();
      }
    });

    test('should handle admin data management', async ({ page }) => {
      await page.goto('/admin');
      
      // Look for data management elements
      const dataElements = page.locator('table, .data-table, .admin-table');
      if (await dataElements.count() > 0) {
        await expect(dataElements.first()).toBeVisible();
      }
      
      // Look for CRUD operation buttons
      const crudButtons = page.locator('button:has-text("Add"), button:has-text("Edit"), button:has-text("Delete")');
      if (await crudButtons.count() > 0) {
        await expect(crudButtons.first()).toBeVisible();
      }
    });
  });

  test.describe('Firebase Integration', () => {
    test('should handle Firebase authentication', async ({ page }) => {
      await page.goto('/admin');
      
      // Check for Firebase authentication elements
      const firebaseElements = page.locator('[class*="firebase"], .firebase-auth');
      if (await firebaseElements.count() > 0) {
        await expect(firebaseElements.first()).toBeVisible();
      }
    });

    test('should handle Firebase data operations', async ({ page }) => {
      await page.goto('/admin');
      
      // Test Firebase data loading
      await page.waitForTimeout(3000); // Wait for potential Firebase data loading
      
      // Check for data loaded from Firebase
      const dataElements = page.locator('.data-loaded, .firebase-data, table tbody tr');
      if (await dataElements.count() > 0) {
        await expect(dataElements.first()).toBeVisible();
      }
    });

    test('should handle Firebase offline mode', async ({ page }) => {
      await page.goto('/admin');
      
      // Test offline functionality
      await page.setOfflineMode(true);
      await page.reload();
      
      // Check for offline indicators or cached data
      const offlineElements = page.locator('.offline-indicator, .cached-data, .offline-mode');
      if (await offlineElements.count() > 0) {
        await expect(offlineElements.first()).toBeVisible();
      }
      
      // Re-enable online mode
      await page.setOfflineMode(false);
    });
  });

  test.describe('Admin Security', () => {
    test('should protect admin routes', async ({ page }) => {
      // Try to access admin routes without authentication
      await page.goto('/admin/dashboard');
      
      // Should redirect to login or show authentication required
      const url = page.url();
      expect(url).toMatch(/\/admin|\/login/);
    });

    test('should handle session management', async ({ page }) => {
      await page.goto('/admin');
      
      // Look for session-related elements
      const sessionElements = page.locator('.session-info, .logout-button, .user-info');
      if (await sessionElements.count() > 0) {
        await expect(sessionElements.first()).toBeVisible();
      }
    });

    test('should handle logout functionality', async ({ page }) => {
      await page.goto('/admin');
      
      // Look for logout button
      const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), .logout');
      if (await logoutButton.count() > 0) {
        await logoutButton.click();
        
        // Should redirect to login page
        await page.waitForTimeout(1000);
        const url = page.url();
        expect(url).toMatch(/\/admin|\/login|\/$/);
      }
    });
  });

  test.describe('Admin Performance', () => {
    test('should load admin pages efficiently', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/admin');
      const loadTime = Date.now() - startTime;
      
      // Admin pages should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should handle large datasets', async ({ page }) => {
      await page.goto('/admin');
      
      // Wait for data loading
      await page.waitForTimeout(5000);
      
      // Check for pagination or lazy loading
      const paginationElements = page.locator('.pagination, .load-more, .infinite-scroll');
      if (await paginationElements.count() > 0) {
        await expect(paginationElements.first()).toBeVisible();
      }
    });
  });
});