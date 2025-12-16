import { test, expect } from '@playwright/test';
import { navigateToWorkspace } from '../helpers/d365-form-utils';

test('ADO #41961: Access Exiting workers from MSS @hr @navigation @mss @workforce @important @regression', async ({ page }) => {
  test.setTimeout(120000);

  console.log('Step 1: Navigate to Manager Self Service workspace (via ESS My team)');
  await navigateToWorkspace(page, 'HcmEmployeeSelfServiceWorkspace');
  
  console.log('Step 2: Click My team tab to access MSS');
  await page.locator('text=My team').first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('Step 3: Click Exiting workers tile');
  await page.locator('text=Exiting workers').first().click();
  await page.waitForLoadState('networkidle');
  await page.locator('[role="main"]').first().waitFor({ timeout: 15000 });

  console.log('Step 4: Verify Exiting workers form opened');
  const main = page.locator('[role="main"]').first();
  await expect(main).toContainText('worker', { timeout: 5000 });

  console.log('✓ Test passed: Exiting workers navigation successful');
  await page.screenshot({ path: 'test-results/id-41961-mss-exiting-workers-navigation.png', fullPage: true });
});
