import { test, expect } from '@playwright/test';
import { navigateToWorkspace } from '../helpers/d365-form-utils';

test('ADO #41521: Navigate to My Teams performance goals @hr @navigation @mss @performance @important @regression', async ({ page }) => {
  test.setTimeout(120000);

  console.log('Step 1: Navigate to Employee Self Service workspace');
  await navigateToWorkspace(page, 'HcmEmployeeSelfServiceWorkspace');

  console.log('Step 2: Click My team menu/tab');
  await page.locator('text=My team').first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('Step 3: Click Team performance goals tile');
  await page.locator('text=Team performance goals').first().click();
  await page.waitForLoadState('networkidle');
  await page.locator('[role="main"]').first().waitFor({ timeout: 15000 });

  console.log('Step 4: Verify Team performance goals form opened');
  const main = page.locator('[role="main"]').first();
  await expect(main).toContainText('goal', { timeout: 5000 });

  console.log('✓ Test passed: Team performance goals navigation successful');
  await page.screenshot({ path: 'test-results/id-41521-team-performance-goals-navigation.png', fullPage: true });
});
