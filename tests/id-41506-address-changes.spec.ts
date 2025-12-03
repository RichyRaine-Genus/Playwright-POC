import { test, expect } from '@playwright/test';
import { navigateToWorkspace } from '../helpers/d365-form-utils';

/**
 * ADO ID-41506
 * Navigate to Personnel Management (Workforce) workspace and open the ChangedPostalAddress control
 * Workspace: mi=HcmWorkforceWorkspace
 * Control: Address changes tile
 */
test('ADO #41506: Navigate to Workforce workspace and open ChangedPostalAddress', async ({ page }) => {
  test.setTimeout(120000);

  // Navigate to Personnel Management workspace
  await navigateToWorkspace(page, 'HcmWorkforceWorkspace');

  // Click the Address changes tile
  const addressChangeTile = page.locator('text=Address changes').first();
  await addressChangeTile.click();
  
  // Wait for navigation
  await page.waitForLoadState('networkidle');
  await page.locator('[role="main"]').first().waitFor({ timeout: 15000 });

  // Verify Address changes list loaded by checking for the Worker column
  const main = page.locator('[role="main"]').first();
  await expect(main).toContainText('Worker', { timeout: 5000 });

  // Save screenshot
  await page.screenshot({ path: 'test-results/id-41506-address-changes.png' });
});
