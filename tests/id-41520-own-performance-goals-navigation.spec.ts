import { test, expect } from '@playwright/test';
import { navigateToWorkspace } from '../helpers/d365-form-utils';

test('ADO #41520: Navigate to Own performance goals @hr @navigation @ess @performance @important @regression', async ({ page }) => {
  test.setTimeout(120000);

  console.log('Step 1: Navigate to Employee Self Service workspace');
  await navigateToWorkspace(page, 'HcmEmployeeSelfServiceWorkspace');

  console.log('Step 2: Click View all goals tile');
  await page.locator('text=View all goals').first().click();
  await page.waitForLoadState('networkidle');
  await page.locator('[role="main"]').first().waitFor({ timeout: 15000 });

  console.log('Step 3: Verify Goals form opened');
  const main = page.locator('[role="main"]').first();
  await expect(main).toContainText('goal', { timeout: 5000 });

  console.log('✓ Test passed: Goals form navigation successful');
  await page.screenshot({ path: 'test-results/id-41520-own-performance-goals-navigation.png', fullPage: true });
});
