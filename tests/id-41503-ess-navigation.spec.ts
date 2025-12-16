import { test, expect } from '@playwright/test';
import { navigateToWorkspace } from '../helpers/d365-form-utils';

test('ADO #41503: Navigate to ESS from default dashboard @hr @navigation @ess @critical @smoke', async ({ page }) => {
  test.setTimeout(120000);

  console.log('Step 1: Navigate to Employee Self Service workspace');
  await navigateToWorkspace(page, 'HcmEmployeeSelfServiceWorkspace');

  console.log('Step 2: Verify ESS workspace opened');
  const main = page.locator('[role="main"]').first();
  // ESS workspace shows "My information" and "My team" tabs, not "Employee self service"
  await expect(main).toContainText('My information', { timeout: 10000 });

  console.log('✓ Test passed: ESS workspace navigation successful');
  await page.screenshot({ path: 'test-results/id-41503-ess-navigation.png', fullPage: true });
});
