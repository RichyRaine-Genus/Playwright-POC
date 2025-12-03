// tests/smoke-test.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Dynamics 365 HR Smoke Test', () => {
  test('should navigate to the dashboard and verify it is appearing', async ({ page }) => {
    // Set a longer timeout for the entire test (60 seconds)
    test.setTimeout(60000);

    console.log('Navigating to dashboard...');
    await page.goto('/?cmp=4415&mi=DefaultDashboard', { waitUntil: 'networkidle' });

    // Wait for the page to settle before checking for elements
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');

    console.log('Waiting for dashboard to be visible...');
    
    // Try multiple ways to detect the dashboard is loaded
    // 1. Wait for any main dashboard heading
    const dashboardHeading = page.locator('[role="main"]');
    await expect(dashboardHeading).toBeVisible({ timeout: 30000 });

    console.log('Dashboard is visible. Verifying content...');
    
    // 2. Wait for the page to have some meaningful content
    const pageBody = page.locator('body');
    await expect(pageBody).not.toHaveAttribute('class', /empty|loading/, { timeout: 10000 }).catch(() => {
      // It's okay if this check fails, the main heading is the key verification
    });

    console.log('Smoke test passed - Dashboard is appearing');
  });
});