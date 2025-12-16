import { test, expect } from '@playwright/test';
import { navigateToWorkspace } from '../helpers/d365-form-utils';

test('ADO #41960: Access team performance goals from MSS @hr @navigation @mss @performance @important @regression', async ({ page }) => {
  test.setTimeout(120000);

  console.log('Step 1: Navigate to Manager Self Service workspace');
  await navigateToWorkspace(page, 'HcmManagerSelfServiceWorkspace');

  console.log('Step 2: Click Team performance goals tile');
  await page.locator('text=Team performance goals').first().click();
  await page.waitForLoadState('networkidle');
  await page.locator('[role="main"]').first().waitFor({ timeout: 15000 });

  console.log('Step 3: Verify Team performance goals shown');
  const main = page.locator('[role="main"]').first();
  await expect(main).toContainText('goal', { timeout: 5000 });

  console.log('✓ Test passed: MSS Team performance goals navigation successful');
  await page.screenshot({ path: 'test-results/id-41960-mss-team-performance-goals-navigation.png', fullPage: true });
});
