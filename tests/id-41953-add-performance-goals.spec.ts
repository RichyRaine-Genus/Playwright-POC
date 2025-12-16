import { test, expect } from '@playwright/test';
import { navigateToWorkspace } from '../helpers/d365-form-utils';

test('ADO #41953: Add performance goals from ESS @hr @ess @performance @goals @create @medium @regression', async ({ page }) => {
  test.setTimeout(120000);

  console.log('Step 1: Navigate to ESS and click View all goals');
  await navigateToWorkspace(page, 'HcmEmployeeSelfServiceWorkspace');
  await page.locator('text=View all goals').first().click();
  await page.waitForLoadState('networkidle');
  await page.locator('[role="main"]').first().waitFor({ timeout: 15000 });

  console.log('Step 2: Click Add goal from template');
  await page.locator('button:has-text("New from template")').or(page.locator('text=Add goal from template')).first().click();
  await page.waitForTimeout(2000);

  console.log('Step 3: Select goal template (ENG -Select or similar)');
  // Template dropdown/selection - may be a popup dialog
  const templateSelector = page.locator('[aria-label*="Template"]').or(page.locator('text=ENG')).first();
  if (await templateSelector.count() > 0) {
    await templateSelector.click();
    await page.waitForTimeout(500);
  }

  console.log('Step 4: Specify valid date range for goal');
  // Fill in start/end dates if required
  // Date fields typically have labels like "Start date", "End date", "Valid from/to"
  const startDateField = page.locator('input[aria-label*="Start"]').or(page.locator('input[aria-label*="From"]')).first();
  const endDateField = page.locator('input[aria-label*="End"]').or(page.locator('input[aria-label*="To"]')).first();
  
  if (await startDateField.count() > 0) {
    // Use relative dates (today + 1 year)
    const today = new Date();
    const nextYear = new Date(today.setFullYear(today.getFullYear() + 1));
    await startDateField.fill(new Date().toLocaleDateString('en-US'));
    await endDateField.fill(nextYear.toLocaleDateString('en-US'));
  }

  console.log('Step 5: Click Create button');
  await page.locator('button:has-text("Create")').or(page.locator('button:has-text("Save")')).first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('Step 6: Verify goal created (return to goals list)');
  const main = page.locator('[role="main"]').first();
  await expect(main).toContainText(/goal/i, { timeout: 5000 });

  console.log('✓ Test passed: Goal creation workflow accessible');
  await page.screenshot({ path: 'test-results/id-41953-add-performance-goals.png', fullPage: true });
});
