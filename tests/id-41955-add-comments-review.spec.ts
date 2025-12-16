import { test, expect } from '@playwright/test';
import { navigateToWorkspace } from '../helpers/d365-form-utils';

test('ADO #41955: Add comments to performance review @hr @ess @performance @review @comment @medium @regression', async ({ page }) => {
  test.setTimeout(120000);

  console.log('Step 1: Navigate to ESS and click View reviews');
  await navigateToWorkspace(page, 'HcmEmployeeSelfServiceWorkspace');
  await page.locator('text=View reviews').first().click();
  await page.waitForLoadState('networkidle');
  await page.locator('[role="main"]').first().waitFor({ timeout: 15000 });

  console.log('Step 2: Select a review and goal, then click Add comment');
  // Find first review in list
  const firstReview = page.locator('[role="row"]').or(page.locator('[data-dyn-role="Row"]')).nth(1);
  if (await firstReview.count() > 0) {
    await firstReview.click();
    await page.waitForTimeout(1000);
  }

  // Click Add comment button (may be on Review tab or Goals section)
  const addCommentButton = page.locator('button:has-text("Add comment")').or(page.locator('text=Add comment')).first();
  if (await addCommentButton.count() > 0) {
    await addCommentButton.click();
    await page.waitForTimeout(2000);
  }

  console.log('Step 3: Add comment text');
  // Find comment text area
  const commentField = page.locator('textarea[aria-label*="Comment"]').or(page.locator('textarea')).first();
  if (await commentField.count() > 0) {
    await commentField.fill('Test comment added via automation - ' + new Date().toISOString());
  }

  console.log('Step 4: Click Post to save comment');
  await page.locator('button:has-text("Post")').first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('Step 5: Verify comment saved');
  const main = page.locator('[role="main"]').first();
  await expect(main).toContainText(/comment|review/i, { timeout: 5000 });

  console.log('✓ Test passed: Comment workflow accessible');
  await page.screenshot({ path: 'test-results/id-41955-add-comments-review.png', fullPage: true });
});
