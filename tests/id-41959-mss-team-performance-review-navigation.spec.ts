import { test, expect } from '@playwright/test';
import { navigateToWorkspace } from '../helpers/d365-form-utils';

test('ADO #41959: Access teams performance review from MSS @hr @navigation @mss @performance @important @regression', async ({ page }) => {
  test.setTimeout(120000);

  console.log('Step 1: Navigate to Manager Self Service workspace');
  await navigateToWorkspace(page, 'HcmManagerSelfServiceWorkspace');

  console.log('Step 2: Click Team performance reviews tile');
  await page.locator('text=Team performance reviews').first().click();
  await page.waitForLoadState('networkidle');
  await page.locator('[role="main"]').first().waitFor({ timeout: 15000 });

  console.log('Step 3: Verify Team performance reviews shown');
  const main = page.locator('[role="main"]').first();
  await expect(main).toContainText('review', { timeout: 5000 });

  console.log('✓ Test passed: MSS Team performance reviews navigation successful');
  await page.screenshot({ path: 'test-results/id-41959-mss-team-performance-review-navigation.png', fullPage: true });
});
