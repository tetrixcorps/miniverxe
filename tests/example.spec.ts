import { test, expect } from '@playwright/test';

test('homepage has TETRIX in title', async ({ page }) => {
  await page.goto('http://host.docker.internal:4325');
  await expect(page).toHaveTitle(/TETRIX/);
});

test('navigation links are visible', async ({ page }) => {
  await page.goto('http://host.docker.internal:4325');
  await expect(page.locator('nav')).toBeVisible();
  await expect(page.locator('a', { hasText: 'Home' })).toBeVisible();
  await expect(page.locator('a', { hasText: 'About' })).toBeVisible();
  await expect(page.locator('a', { hasText: 'Solutions' })).toBeVisible();
  await expect(page.locator('a', { hasText: 'Services' })).toBeVisible();
  await expect(page.locator('a', { hasText: 'Contact' })).toBeVisible();
}); 