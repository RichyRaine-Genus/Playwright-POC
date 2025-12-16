import { test, expect } from '@playwright/test';
import { navigateToWorkspace } from '../helpers/d365-form-utils';

test('ADO #41518: Navigate to Compensation Management @hr @navigation @compensation @important @regression', async ({ page }) => {
  test.setTimeout(120000);

  console.log('Step 1: Navigate to Compensation Management workspace');
  await navigateToWorkspace(page, 'HcmCompensationWorkspace');

  console.log('Step 2: Verify Compensation Management workspace opened');
  const main = page.locator('[role="main"]').first();
  await expect(main).toContainText('Compensation', { timeout: 10000 });

  console.log('✓ Test passed: Compensation Management workspace navigation successful');
  await page.screenshot({ path: 'test-results/id-41518-compensation-management-navigation.png', fullPage: true });
});
