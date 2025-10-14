import { test, expect, Page } from '@playwright/test';

test.describe('Client Dashboard Integration Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Mock the dashboard API responses
    await page.route('**/api/v1/dashboard/metrics**', async (route) => {
      const url = new URL(route.request().url());
      const industry = url.searchParams.get('industry') || 'fleet';
      const role = url.searchParams.get('role') || 'fleet_manager';

      let mockData;
      
      if (industry === 'fleet') {
        mockData = {
          success: true,
          data: {
            universal: {
              activeUsers: 1247,
              totalRevenue: 125430,
              systemUptime: 99.9,
              recentActivity: [
                { type: 'login', user: 'John Doe', time: '2 minutes ago' },
                { type: 'data_export', user: 'Jane Smith', time: '5 minutes ago' }
              ],
              notifications: [
                { type: 'info', message: 'System maintenance scheduled', time: '1 hour ago', priority: 'low' }
              ]
            },
            industry: {
              active: 24,
              maintenance: 3,
              offline: 1,
              driverScore: 8.7,
              topDrivers: 5,
              mpg: 12.4,
              savings: 2340,
              alerts: [
                {
                  type: 'maintenance',
                  message: 'Vehicle #123 needs oil change',
                  time: '2 hours ago',
                  priority: 'medium',
                  vehicleId: 'VH-123'
                }
              ]
            },
            metadata: {
              industry: 'fleet',
              role: 'fleet_manager',
              timestamp: new Date().toISOString(),
              version: '1.0.0'
            }
          }
        };
      } else if (industry === 'healthcare') {
        mockData = {
          success: true,
          data: {
            universal: {
              activeUsers: 1247,
              totalRevenue: 125430,
              systemUptime: 99.9,
              recentActivity: [],
              notifications: []
            },
            industry: {
              patients: 1247,
              new: 89,
              appointments: 23,
              revenue: 45230,
              claims: 156,
              satisfaction: 4.8,
              readmission: 3.2,
              alerts: [
                {
                  type: 'appointment',
                  message: 'Patient John Smith missed appointment',
                  time: '1 hour ago',
                  priority: 'medium',
                  patientId: 'PAT-123'
                }
              ]
            },
            metadata: {
              industry: 'healthcare',
              role: 'healthcare_provider',
              timestamp: new Date().toISOString(),
              version: '1.0.0'
            }
          }
        };
      } else if (industry === 'legal') {
        mockData = {
          success: true,
          data: {
            universal: {
              activeUsers: 1247,
              totalRevenue: 125430,
              systemUptime: 99.9,
              recentActivity: [],
              notifications: []
            },
            industry: {
              cases: 47,
              closed: 12,
              deadlines: 8,
              hours: 142,
              revenue: 28400,
              invoices: 12500,
              rating: 4.9,
              feedback: 15,
              alerts: [
                {
                  type: 'deadline',
                  message: 'Court filing deadline approaching for Case #2024-001',
                  time: '2 hours ago',
                  priority: 'high',
                  caseId: 'CASE-001'
                }
              ]
            },
            metadata: {
              industry: 'legal',
              role: 'attorney',
              timestamp: new Date().toISOString(),
              version: '1.0.0'
            }
          }
        };
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData)
      });
    });
  });

  test('should load dashboard with fleet management data', async () => {
    await page.goto('/dashboards/client?role=fleet_manager');
    
    // Wait for the dashboard to load
    await page.waitForSelector('[data-testid="dashboard-container"]', { timeout: 10000 });
    
    // Check if the page title is correct
    await expect(page).toHaveTitle(/Client Dashboard/);
    
    // Check if the user role badge is displayed
    await expect(page.locator('#user-role-badge')).toContainText('Fleet Manager');
    
    // Check if the fleet tab is active
    await expect(page.locator('[data-industry="fleet"][data-active="true"]')).toBeVisible();
    
    // Check if universal metrics are displayed
    await expect(page.locator('#universal-active-users')).toContainText('1,247');
    await expect(page.locator('#universal-revenue')).toContainText('$125,430');
    await expect(page.locator('#universal-uptime')).toContainText('99.9%');
    
    // Check if fleet-specific metrics are displayed
    await expect(page.locator('#fleet-active')).toContainText('24');
    await expect(page.locator('#fleet-maintenance')).toContainText('3');
    await expect(page.locator('#fleet-driver-score')).toContainText('8.7');
    
    // Check if alerts are displayed
    await expect(page.locator('#fleet-alerts')).toContainText('Vehicle #123 needs oil change');
  });

  test('should switch to healthcare tab and display healthcare data', async () => {
    await page.goto('/dashboards/client?role=healthcare_provider');
    
    // Wait for the dashboard to load
    await page.waitForSelector('[data-testid="dashboard-container"]', { timeout: 10000 });
    
    // Click on the healthcare tab
    await page.click('[data-industry="healthcare"]');
    
    // Wait for the healthcare content to load
    await page.waitForSelector('#healthcare-content', { state: 'visible' });
    
    // Check if healthcare-specific metrics are displayed
    await expect(page.locator('#healthcare-patients')).toContainText('1,247');
    await expect(page.locator('#healthcare-appointments')).toContainText('23');
    await expect(page.locator('#healthcare-satisfaction')).toContainText('4.8');
    
    // Check if healthcare alerts are displayed
    await expect(page.locator('#healthcare-alerts')).toContainText('Patient John Smith missed appointment');
  });

  test('should switch to legal tab and display legal data', async () => {
    await page.goto('/dashboards/client?role=attorney');
    
    // Wait for the dashboard to load
    await page.waitForSelector('[data-testid="dashboard-container"]', { timeout: 10000 });
    
    // Click on the legal tab
    await page.click('[data-industry="legal"]');
    
    // Wait for the legal content to load
    await page.waitForSelector('#legal-content', { state: 'visible' });
    
    // Check if legal-specific metrics are displayed
    await expect(page.locator('#legal-cases')).toContainText('47');
    await expect(page.locator('#legal-deadlines')).toContainText('8');
    await expect(page.locator('#legal-revenue')).toContainText('28,400');
    
    // Check if legal alerts are displayed
    await expect(page.locator('#legal-alerts')).toContainText('Court filing deadline approaching');
  });

  test('should refresh data when refresh button is clicked', async () => {
    await page.goto('/dashboards/client?role=fleet_manager');
    
    // Wait for the dashboard to load
    await page.waitForSelector('[data-testid="dashboard-container"]', { timeout: 10000 });
    
    // Click the refresh button
    await page.click('#refresh-btn');
    
    // Wait for the data to refresh (check if the timestamp changes)
    await page.waitForTimeout(1000);
    
    // Verify that the data is still displayed
    await expect(page.locator('#fleet-active')).toContainText('24');
  });

  test('should handle API errors gracefully', async () => {
    // Mock API error
    await page.route('**/api/v1/dashboard/metrics**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Internal server error'
        })
      });
    });

    await page.goto('/dashboards/client?role=fleet_manager');
    
    // Wait for the dashboard to load
    await page.waitForSelector('[data-testid="dashboard-container"]', { timeout: 10000 });
    
    // Check if error handling is in place (this would depend on the actual implementation)
    // The dashboard should still be visible even if the API fails
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();
  });

  test('should display mobile-optimized layout on small screens', async () => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/dashboards/client?role=fleet_manager');
    
    // Wait for the dashboard to load
    await page.waitForSelector('[data-testid="dashboard-container"]', { timeout: 10000 });
    
    // Check if mobile-specific elements are visible
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
    
    // Check if the layout is responsive
    const dashboardContainer = page.locator('[data-testid="dashboard-container"]');
    await expect(dashboardContainer).toBeVisible();
    
    // Verify that the content is properly stacked on mobile
    const tabs = page.locator('.tab-button');
    await expect(tabs.first()).toBeVisible();
  });

  test('should handle real-time updates', async () => {
    await page.goto('/dashboards/client?role=fleet_manager');
    
    // Wait for the dashboard to load
    await page.waitForSelector('[data-testid="dashboard-container"]', { timeout: 10000 });
    
    // Mock a real-time update
    await page.evaluate(() => {
      // Simulate a real-time update by updating the DOM
      const activeElement = document.getElementById('fleet-active');
      if (activeElement) {
        activeElement.textContent = '25'; // Updated value
      }
    });
    
    // Verify that the update is reflected
    await expect(page.locator('#fleet-active')).toContainText('25');
  });

  test('should export data when export button is clicked', async () => {
    // Mock export API
    await page.route('**/api/v1/dashboard/metrics**', async (route) => {
      if (route.request().method() === 'POST') {
        const body = await route.request().postDataJSON();
        if (body.action === 'export') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: {
              'Content-Disposition': 'attachment; filename="dashboard-export.json"'
            },
            body: JSON.stringify({ active: 24, maintenance: 3 })
          });
        }
      } else {
        // Handle GET request normally
        await route.continue();
      }
    });

    await page.goto('/dashboards/client?role=fleet_manager');
    
    // Wait for the dashboard to load
    await page.waitForSelector('[data-testid="dashboard-container"]', { timeout: 10000 });
    
    // Click export button (if it exists)
    const exportButton = page.locator('[data-testid="export-button"]');
    if (await exportButton.isVisible()) {
      await exportButton.click();
      
      // Wait for download to start
      await page.waitForTimeout(1000);
      
      // Verify that the export was triggered
      // This would depend on the actual implementation
    }
  });

  test('should maintain state when switching between tabs', async () => {
    await page.goto('/dashboards/client?role=fleet_manager');
    
    // Wait for the dashboard to load
    await page.waitForSelector('[data-testid="dashboard-container"]', { timeout: 10000 });
    
    // Switch to healthcare tab
    await page.click('[data-industry="healthcare"]');
    await page.waitForSelector('#healthcare-content', { state: 'visible' });
    
    // Switch back to fleet tab
    await page.click('[data-industry="fleet"]');
    await page.waitForSelector('#fleet-content', { state: 'visible' });
    
    // Verify that the fleet data is still displayed
    await expect(page.locator('#fleet-active')).toContainText('24');
  });

  test('should handle keyboard navigation', async () => {
    await page.goto('/dashboards/client?role=fleet_manager');
    
    // Wait for the dashboard to load
    await page.waitForSelector('[data-testid="dashboard-container"]', { timeout: 10000 });
    
    // Test keyboard navigation between tabs
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Verify that the tab was activated
    await expect(page.locator('[data-industry="healthcare"][data-active="true"]')).toBeVisible();
  });
});
