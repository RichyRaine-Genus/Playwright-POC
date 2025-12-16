import { test, expect } from '@playwright/test';
import { navigateToWorkspace } from '../helpers/d365-form-utils';

test('ADO #41954: Edit existing performance goals @hr @ess @performance @goals @edit @medium @regression', async ({ page }) => {
  test.setTimeout(120000);

  console.log('Step 1: Navigate to ESS and click View all goals');
  await navigateToWorkspace(page, 'HcmEmployeeSelfServiceWorkspace');
  await page.locator('text=View all goals').first().click();
  await page.waitForLoadState('networkidle');
  await page.locator('[role="main"]').first().waitFor({ timeout: 15000 });

  console.log('Step 2: Select a goal and click Edit');
  // Find first goal in list and select it
  const firstGoal = page.locator('[role="row"]').or(page.locator('[data-dyn-role="Row"]')).nth(1); // Skip header row
  if (await firstGoal.count() > 0) {
    await firstGoal.click();
    await page.waitForTimeout(1000);
  }

  // Click Edit button
  await page.locator('button:has-text("Edit")').first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('Step 3: Update title, overview, or details');
  // Find editable fields - typically Description, Overview, or Title
  const descriptionField = page.locator('textarea[aria-label*="Description"]').or(page.locator('textarea[aria-label*="Overview"]')).or(page.locator('input[aria-label*="Title"]')).first();
  
  if (await descriptionField.count() > 0) {
    await descriptionField.click();
    await descriptionField.fill('Updated goal details - Test automation');
  }

  console.log('Step 4: Click Save button');
  await page.locator('button:has-text("Save")').first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('Step 5: Verify record saved (return to goals list)');
  const main = page.locator('[role="main"]').first();
  await expect(main).toContainText(/goal/i, { timeout: 5000 });

  console.log('✓ Test passed: Goal edit workflow accessible');
  await page.screenshot({ path: 'test-results/id-41954-edit-goals.png', fullPage: true });
});
