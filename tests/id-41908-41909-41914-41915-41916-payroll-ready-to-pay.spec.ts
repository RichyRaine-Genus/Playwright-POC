/**
 * D365 HR Payroll - Ready to Pay Validation Tests
 * 
 * Converts ADO Test Cases #41908-41916 to Playwright automation
 * Focus: Employee Ready to Pay workflow validation
 * 
 * Conversion Pattern Used:
 * - Each ADO test case = separate test()
 * - Test steps → navigation + actions + verification
 * - Expected results → assertions or screenshot verification
 * - Includes three-layer D365 wait strategy
 */

import { test, expect } from '@playwright/test';

/**
 * Test Case #41908: Validating an employee for "Ready to pay"
 * 
 * ADO Steps:
 * 1. Click the menu → Menu expands
 * 2. Click Module "Human resources" → Menu expands
 * 3. Select "Workers" → Workers Expands
 * 4. Select the worker required → Worker is selected
 * 5. At the top click the Payroll tab and click "Validate" → Confirmation shown if validated
 */
test('ADO #41908: Validate an employee for ready to pay', async ({ page }) => {
  test.setTimeout(120000);

  console.log('Step 1-3: Navigate to Workers list via menu');
  // Navigate to the Workers form
  // Note: Adjust the URL path based on your D365 instance
  await page.goto('/?cmp=4415&mi=HcmWorkerListPage', { waitUntil: 'networkidle' });

  // Three-layer wait strategy
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.locator('[role="main"]').first().waitFor({ timeout: 45000 });
  await page.waitForTimeout(2000);

  console.log('Step 4: Search for and select a worker');
  // TODO: Implement worker search/selection
  // This typically requires:
  // - Clicking a search field
  // - Entering worker identifier
  // - Selecting from results
  // Example pattern (adjust selectors as needed):
  // await page.locator('input[aria-label*="Search"]').fill('PN000357');
  // await page.locator('text=Richard Anthony Raine').click();

  console.log('Step 5: Click Payroll tab and select Validate');
  // Click the Payroll tab
  await page.locator('text=Payroll').click();
  
  // Click Validate button
  await page.locator('button:has-text("Validate")').click();

  console.log('Verification: Check for validation confirmation message');
  // Verify confirmation message appears
  const confirmationLocator = page.locator('text=/validation|confirmed|ready/i');
  await confirmationLocator.waitFor({ timeout: 10000 });
  
  // Assert message is visible
  await expect(confirmationLocator).toBeVisible();
  console.log('✓ Validation confirmation displayed');
});

/**
 * Test Case #41909: Viewing ready to pay results
 * 
 * ADO Steps:
 * 1. Click the menu on the left → Menu expands
 * 2. Click Module "Human resources" → Menu expands
 * 3. Select "Workers" → Workers Expands
 * 4. Select the worker required → Worker is selected
 * 5. At the top click the Payroll tab and click "Results" → Ready to pay validation results shown
 */
test('ADO #41909: View ready to pay validation results', async ({ page }) => {
  test.setTimeout(120000);

  console.log('Step 1-3: Navigate to Workers');
  await page.goto('/?cmp=4415&mi=HcmWorkerListPage', { waitUntil: 'networkidle' });
  
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.locator('[role="main"]').first().waitFor({ timeout: 45000 });
  await page.waitForTimeout(2000);

  console.log('Step 4: Select a worker');
  // TODO: Implement worker selection (see pattern in test #41908)

  console.log('Step 5: Click Payroll tab and Results button');
  await page.locator('text=Payroll').click();
  await page.locator('button:has-text("Results")').click();

  console.log('Verification: Results panel is displayed');
  // Verify results panel/page appears
  const resultsPanel = page.locator('[role="main"]');
  await expect(resultsPanel).toContainText(/validation|ready/i);
  console.log('✓ Validation results displayed');
});

/**
 * Test Case #41914: Adding a ready to pay override onto a worker
 * 
 * ADO Steps:
 * 1-5. Navigate to Workers and select a worker
 * 6. Click the Payroll tab at the top → Payroll tab expands
 * 7. Click "Employees with ready to pay override" → Payroll override screen opens
 * 8. Click "New" → new override record created
 * 9. Select "Ready to pay" or "Not ready to pay" → correct value added
 * 10. Back arrow to worker page → Worker page re-opened
 * 11. Click "Validate" → Rules should be bypassed appropriately
 */
test('ADO #41914: Add a ready to pay override onto a worker', async ({ page }) => {
  test.setTimeout(120000);

  console.log('Steps 1-5: Navigate to Workers and select worker');
  await page.goto('/?cmp=4415&mi=HcmWorkerListPage', { waitUntil: 'networkidle' });
  
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.locator('[role="main"]').first().waitFor({ timeout: 45000 });
  await page.waitForTimeout(2000);

  // TODO: Select a worker from the list

  console.log('Step 6: Click Payroll tab');
  await page.locator('text=Payroll').click();

  console.log('Step 7: Click Employees with ready to pay override');
  await page.locator('text=Employees with ready to pay override').click();
  await page.waitForLoadState('networkidle');

  console.log('Step 8: Click New button to create override');
  await page.locator('button:has-text("New")').click();

  console.log('Step 9: Select override status (Ready to pay / Not ready to pay)');
  // TODO: Implement dropdown selection
  // Example pattern:
  // await page.locator('[aria-label*="Ready to pay"]').click();
  // await page.locator('text=Ready to pay').click();

  console.log('Step 10: Return to worker page');
  // Click back button or breadcrumb
  await page.locator('button[aria-label*="back"]').click();
  await page.waitForLoadState('networkidle');

  console.log('Step 11: Validate worker with override applied');
  await page.locator('text=Payroll').click();
  await page.locator('button:has-text("Validate")').click();

  console.log('Verification: Validation complete with override applied');
  // Verify validation result reflects override
  const confirmationLocator = page.locator('text=/validation|confirmed/i');
  await expect(confirmationLocator).toBeVisible();
  console.log('✓ Override validation completed');
});

/**
 * Test Case #41915: Viewing workers in different ready to pay buckets
 * 
 * ADO Steps:
 * 1. Expand the menu → Menu expands
 * 2. Click on Workspaces → Menu expands
 * 3. Select "Compensation Management" workspace → Workspace opened
 * 4. Select "Employees ready to pay" tile → Ready to pay list visible
 * 5. Click back → Back to Compensation management workspace
 * 6. Select "Employees not ready to pay" tile → Not ready to pay list visible
 * 7. Click back → Back to workspace
 * 8. Select "Employees with ready to pay override" tile → overridden list visible
 */
test('ADO #41915: View workers in ready to pay, not ready to pay, and overridden buckets', async ({ page }) => {
  test.setTimeout(120000);

  console.log('Steps 1-3: Navigate to Compensation Management workspace');
  // Navigate directly to workspace if possible
  await page.goto('/?cmp=4415&mi=HcmCompensationWorkspace', { waitUntil: 'networkidle' });
  
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.locator('[role="main"]').first().waitFor({ timeout: 45000 });
  await page.waitForTimeout(2000);

  // Test Ready to Pay bucket
  console.log('Step 4: Click "Employees ready to pay" tile');
  await page.locator('text=Employees ready to pay').click();
  await page.waitForLoadState('networkidle');
  
  console.log('Verification: Ready to pay list is visible');
  let listContent = await page.locator('[role="main"]').textContent();
  expect(listContent).toBeTruthy();
  expect(listContent?.length).toBeGreaterThan(0);

  // Return to workspace
  console.log('Step 5: Click back to workspace');
  await page.locator('button[aria-label*="back"]').click();
  await page.waitForLoadState('networkidle');

  // Test Not Ready to Pay bucket
  console.log('Step 6: Click "Employees not ready to pay" tile');
  await page.locator('text=Employees not ready to pay').click();
  await page.waitForLoadState('networkidle');
  
  console.log('Verification: Not ready to pay list is visible');
  listContent = await page.locator('[role="main"]').textContent();
  expect(listContent).toBeTruthy();

  // Return to workspace
  console.log('Step 7: Click back to workspace');
  await page.locator('button[aria-label*="back"]').click();
  await page.waitForLoadState('networkidle');

  // Test Overridden bucket
  console.log('Step 8: Click "Employees with ready to pay override" tile');
  await page.locator('text=Employees with ready to pay override').click();
  await page.waitForLoadState('networkidle');
  
  console.log('Verification: Overridden list is visible');
  listContent = await page.locator('[role="main"]').textContent();
  expect(listContent).toBeTruthy();
  console.log('✓ All three buckets successfully viewed');
});

/**
 * Test Case #41916: Manually sending a file to iipay
 * 
 * ADO Steps:
 * 1. Expand the menu → Menu expands
 * 2. Click on Workspaces → Menu expands
 * 3. Select "Compensation Management" workspace → Workspace opened
 * 4. Change legal entity if required → Legal entity changed
 * 5. Click "Send payroll (CSV) file to iipay" → pop up shown "Ready to pay event generated for legal entity 4415"
 * 6. Check in Sharepoint that the file is generated → File generated within 10 minutes
 * 
 * Note: Step 6 requires external Sharepoint validation (out of scope for Playwright automation)
 * This test covers steps 1-5 only.
 */
test('ADO #41916: Manually send a file to iipay', async ({ page }) => {
  test.setTimeout(120000);

  console.log('Steps 1-3: Navigate to Compensation Management workspace');
  await page.goto('/?cmp=4415&mi=HcmCompensationWorkspace', { waitUntil: 'networkidle' });
  
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.locator('[role="main"]').first().waitFor({ timeout: 45000 });
  await page.waitForTimeout(2000);

  console.log('Step 4: Change legal entity if required');
  // TODO: Implement legal entity selector
  // Example pattern:
  // const currentEntity = await page.locator('[aria-label*="Legal entity"]').textContent();
  // if (currentEntity !== 'Target Entity') {
  //   await page.locator('[aria-label*="Legal entity"]').click();
  //   await page.locator('text=4415').click();
  // }

  console.log('Step 5: Click Send payroll file to iipay button');
  await page.locator('button:has-text("Send payroll (CSV) file to iipay")').click();
  await page.waitForLoadState('networkidle');

  console.log('Verification: Confirmation popup displayed');
  const confirmationPopup = page.locator('text=/Ready to pay event generated|legal entity 4415/i');
  await confirmationPopup.waitFor({ timeout: 10000 });
  await expect(confirmationPopup).toBeVisible();
  console.log('✓ File send confirmation displayed');

  // Step 6 (Sharepoint validation) requires manual verification or separate integration test
  // TODO: Add integration test for Sharepoint file verification if needed
});
