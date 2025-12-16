import { test, expect } from '@playwright/test';
import { navigateToWorkspace } from '../helpers/d365-form-utils';

test('ADO #41519: Navigate to Own Employee performance review @hr @navigation @ess @performance @important @regression', async ({ page }) => {
  test.setTimeout(120000);

  console.log('Step 1: Navigate to Employee Self Service workspace');
  await navigateToWorkspace(page, 'HcmEmployeeSelfServiceWorkspace');

  console.log('Step 2: Click View reviews tile');
  await page.locator('text=View reviews').first().click();
  await page.waitForLoadState('networkidle');
  await page.locator('[role="main"]').first().waitFor({ timeout: 15000 });

  console.log('Step 3: Verify Performance review form opened');
  const main = page.locator('[role="main"]').first();
  await expect(main).toContainText('review', { timeout: 5000 });

  console.log('✓ Test passed: Performance review form navigation successful');
  await page.screenshot({ path: 'test-results/id-41519-own-performance-review-navigation.png', fullPage: true });
});
