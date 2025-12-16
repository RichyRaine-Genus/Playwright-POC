import { test, expect } from '@playwright/test';
import { navigateToWorkspace } from '../helpers/d365-form-utils';

test('ADO #41962: Access Open positions (Direct & Extended) from MSS @hr @mss @positions @view @important @regression', async ({ page }) => {
  test.setTimeout(120000);

  console.log('Step 1: Navigate to ESS and click My team tab');
  await navigateToWorkspace(page, 'HcmEmployeeSelfServiceWorkspace');
  await page.locator('text=My team').first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('Step 2: Click Open positions - Direct reports tile');
  await page.locator('text=Open positions - Direct reports').first().click();
  await page.waitForLoadState('networkidle');
  await page.locator('[role="main"]').first().waitFor({ timeout: 15000 });

  console.log('Step 3: Verify Open positions form opened');
  const main = page.locator('[role="main"]').first();
  await expect(main).toContainText(/position|open/i, { timeout: 5000 });

  console.log('Step 4: Navigate back to ESS My team');
  // Use direct navigation instead of goBack to avoid state issues
  await navigateToWorkspace(page, 'HcmEmployeeSelfServiceWorkspace');
  await page.locator('text=My team').first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('Step 5: Click Open positions - Extended reports tile');
  await page.locator('text=Open positions - Extended reports').first().click();
  await page.waitForLoadState('networkidle');
  await page.locator('[role="main"]').first().waitFor({ timeout: 15000 });

  console.log('Step 6: Verify Open positions extended form opened');
  await expect(main).toContainText(/position|open/i, { timeout: 5000 });

  console.log('✓ Test passed: Both Open positions views accessible');
  await page.screenshot({ path: 'test-results/id-41962-open-positions-navigation.png', fullPage: true });
});
