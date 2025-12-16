import { test, expect } from '@playwright/test';

test('ADO #41513: Navigate to Workers @hr @navigation @workers @important @regression', async ({ page }) => {
  test.setTimeout(120000);

  console.log('Step 1: Navigate directly to Workers form using URL');
  await page.goto('/?cmp=4415&mi=HcmWorkerListPage', { waitUntil: 'networkidle' });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.locator('[role="main"]').first().waitFor({ timeout: 15000 });
  await page.waitForTimeout(2000);

  console.log('Step 2: Verify Workers form opened');
  const main = page.locator('[role="main"]').first();
  await expect(main).toContainText('Worker', { timeout: 5000 });

  console.log('✓ Test passed: Workers form navigation successful');
  await page.screenshot({ path: 'test-results/id-41513-workers-navigation.png', fullPage: true });
});
