import { test, expect } from '@playwright/test';
import { navigateToWorkspace } from '../helpers/d365-form-utils';

test('ADO #41963: Access My worker and position actions from MSS @hr @mss @actions @view @important @regression', async ({ page }) => {
  test.setTimeout(120000);

  console.log('Step 1: Navigate to ESS and click My team tab');
  await navigateToWorkspace(page, 'HcmEmployeeSelfServiceWorkspace');
  await page.locator('text=My team').first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('Step 2: Under related links, click My worker actions');
  // Related links are typically in a side panel or section
  await page.locator('text=My worker actions').first().click();
  await page.waitForLoadState('networkidle');
  await page.locator('[role="main"]').first().waitFor({ timeout: 15000 });

  console.log('Step 3: Verify Worker actions shown');
  const main = page.locator('[role="main"]').first();
  await expect(main).toContainText(/worker|action/i, { timeout: 5000 });

  console.log('Step 4: Navigate back to ESS My team');
  // Use direct navigation instead of goBack to avoid state issues
  await navigateToWorkspace(page, 'HcmEmployeeSelfServiceWorkspace');
  await page.locator('text=My team').first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('Step 5: Under related links, click My position actions');
  await page.locator('text=My position actions').first().click();
  await page.waitForLoadState('networkidle');
  await page.locator('[role="main"]').first().waitFor({ timeout: 15000 });

  console.log('Step 6: Verify Position actions shown');
  await expect(main).toContainText(/position|action/i, { timeout: 5000 });

  console.log('✓ Test passed: Worker and position actions accessible');
  await page.screenshot({ path: 'test-results/id-41963-worker-position-actions-navigation.png', fullPage: true });
});
