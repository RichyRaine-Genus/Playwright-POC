import { test, expect } from '@playwright/test';
import { navigateToWorkspace } from '../helpers/d365-form-utils';

test('ADO #41522: Navigate to My Teams performance reviews @hr @navigation @mss @performance @important @regression', async ({ page }) => {
  test.setTimeout(120000);

  console.log('Step 1: Navigate to Employee Self Service workspace');
  await navigateToWorkspace(page, 'HcmEmployeeSelfServiceWorkspace');

  console.log('Step 2: Click My team menu/tab');
  await page.locator('text=My team').first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('Step 3: Click Team performance reviews tile');
  await page.locator('text=Team performance reviews').first().click();
  await page.waitForLoadState('networkidle');
  await page.locator('[role="main"]').first().waitFor({ timeout: 15000 });

  console.log('Step 4: Verify Team performance reviews form opened');
  const main = page.locator('[role="main"]').first();
  await expect(main).toContainText('review', { timeout: 5000 });

  console.log('✓ Test passed: Team performance reviews navigation successful');
  await page.screenshot({ path: 'test-results/id-41522-team-performance-reviews-navigation.png', fullPage: true });
});
