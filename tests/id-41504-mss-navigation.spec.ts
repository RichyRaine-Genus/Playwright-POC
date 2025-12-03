import { test, expect } from '@playwright/test';
import { navigateToWorkspace } from '../helpers/d365-form-utils';

/**
 * ADO ID-41504
 * Navigate to MSS (My Team) from the Default Dashboard and open Manager tab
 * Workspace: mi=HcmEmployeeSelfServiceWorkspace
 * Control: ManagerTabPage (open the Manager / My team view)
 */
test('ADO #41504: Navigate to MSS workspace and open Manager tab', async ({ page }) => {
  test.setTimeout(120000);

  // Use workspace navigator helper (applies the three-layer wait strategy)
  await navigateToWorkspace(page, 'HcmEmployeeSelfServiceWorkspace');

  // Try several robust locator strategies for the Manager tab/control
  const candidateLocators = [
    page.locator('[data-control-name="ManagerTabPage"]'),
    page.locator('#ManagerTabPage'),
    page.locator('[aria-label*="Manager"]'),
    page.locator('role=tab[name="Manager"]'),
    page.locator('text=Manager'),
    page.locator('text=My team')
  ];

  let clicked = false;
  for (const loc of candidateLocators) {
    try {
      const count = await loc.count();
      if (count > 0) {
        // Ensure it's visible before clicking
        if (await loc.first().isVisible()) {
          await loc.first().click();
          clicked = true;
          break;
        }
      }
    } catch (e) {
      // ignore and try next locator
    }
  }

  // If none of the locators worked, fail with a helpful message
  if (!clicked) {
    throw new Error('Unable to find or click Manager tab/control. Consider adding a direct URL or updating the URL glossary for HcmEmployeeSelfServiceWorkspace and the ManagerTabPage selector.');
  }

  // After clicking, wait for expected Manager (My team) content to appear
  const myTeamLocator = page.locator('text=My team').first();
  await myTeamLocator.waitFor({ timeout: 15000 });
  await expect(myTeamLocator).toBeVisible();

  // Optional: take a screenshot for verification when running locally
  await page.screenshot({ path: 'test-results/id-41504-mss-navigation.png', fullPage: false });

});
