import { test, expect } from '@playwright/test';

test('ADO #41515: Navigate to Positions @hr @navigation @positions @important @regression', async ({ page }) => {
  test.setTimeout(120000);

  console.log('Step 1: Navigate directly to Positions form using URL');
  await page.goto('/?cmp=4415&mi=HcmPositionList', { waitUntil: 'networkidle' });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  // Positions form may take longer to load - increase timeout and add extra wait
  await page.waitForTimeout(3000);
  await page.locator('[role="main"]').first().waitFor({ timeout: 30000 });

  console.log('Step 2: Verify Positions form opened');
  const main = page.locator('[role="main"]').first();
  await expect(main).toContainText('Position', { timeout: 5000 });

  console.log('✓ Test passed: Positions form navigation successful');
  await page.screenshot({ path: 'test-results/id-41515-positions-navigation.png', fullPage: true });
});
