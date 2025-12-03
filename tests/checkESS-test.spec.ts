// tests/checkESS-test.spec.ts
/**
 * D365 F&O Employee Self Service (ESS) Workspace Test
 * 
 * This test demonstrates how to:
 * 1. Navigate to the ESS workspace
 * 2. Extract employee data (Years of Service, Reports To)
 * 3. Assert the data is valid and non-empty
 * 
 * Key learnings for D365 F&O data extraction:
 * - Always wait for networkidle after navigation
 * - D365 workspaces load dynamically, allow extra time
 * - Use XPath with text() for reliable label lookup
 * - Walk up the DOM tree from labels to find associated inputs
 * - Inputs often contain person IDs or numeric values
 */

import { test, expect } from '@playwright/test';

test.describe('Dynamics 365 HR Employee Self Service Test', () => {
  test('should navigate to ESS workspace and retrieve employee data', async ({ page }) => {
    test.setTimeout(120000);

    console.log('Step 1: Navigate to ESS workspace');
    await page.goto('/?cmp=4415&mi=HcmEmployeeSelfServiceWorkspace', { waitUntil: 'networkidle' });

    console.log('Step 2: Wait for page to fully load');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');

    console.log('Step 3: Wait for ESS content to appear');
    await page.locator('[role="main"]').first().waitFor({ timeout: 45000 });
    await page.waitForTimeout(2000); // Give dynamic content time to render

    console.log('Step 4: Extract Years of Service');
    const yearsOfService = await page.evaluate(() => {
      const labels = document.querySelectorAll('label');
      for (let label of labels) {
        if (label.textContent?.toLowerCase().includes('years')) {
          const labelId = label.getAttribute('id');
          
          // Strategy 1: Use aria-labelledby to find associated input
          if (labelId) {
            const element = document.querySelector(`[aria-labelledby="${labelId}"]`);
            if (element && (element as any).value) {
              return (element as any).value;
            }
          }

          // Strategy 2: For read-only fields, get text content from parent
          let parent = label.parentElement;
          for (let level = 0; level < 4 && parent; level++) {
            const fullText = parent.textContent?.trim() || '';
            let displayValue = fullText.replace(label.textContent || '', '').trim();
            displayValue = displayValue.replace(/\s+/g, ' ').trim();
            
            if (displayValue && displayValue.length > 0 && displayValue.length < 200) {
              return displayValue;
            }
            parent = parent.parentElement;
          }

          // Strategy 3: Look for input
          parent = label.parentElement;
          while (parent && parent.tagName !== 'FORM') {
            const input = parent.querySelector('input[type="text"], input:not([type="hidden"])');
            if (input && (input as HTMLInputElement).value) {
              return (input as HTMLInputElement).value;
            }
            parent = parent.parentElement;
          }
        }
      }
      return null;
    });

    console.log(`Years of Service: ${yearsOfService}`);
    expect(yearsOfService).toBeTruthy();
    expect(yearsOfService?.length).toBeGreaterThan(0);

    console.log('Step 5: Extract Reports To');
    const reportsTo = await page.evaluate(() => {
      const labels = document.querySelectorAll('label');
      for (let label of labels) {
        if (label.textContent?.toLowerCase().includes('report')) {
          const labelId = label.getAttribute('id');
          
          // Strategy 1: Use aria-labelledby to find associated input
          if (labelId) {
            const element = document.querySelector(`[aria-labelledby="${labelId}"]`);
            if (element && (element as any).value) {
              return (element as any).value;
            }
          }

          // Strategy 2: For read-only fields, get text content from parent
          let parent = label.parentElement;
          for (let level = 0; level < 4 && parent; level++) {
            const fullText = parent.textContent?.trim() || '';
            let displayValue = fullText.replace(label.textContent || '', '').trim();
            displayValue = displayValue.replace(/\s+/g, ' ').trim();
            
            if (displayValue && displayValue.length > 0 && displayValue.length < 200) {
              return displayValue;
            }
            parent = parent.parentElement;
          }

          // Strategy 3: Look for input
          parent = label.parentElement;
          while (parent && parent.tagName !== 'FORM') {
            const input = parent.querySelector('input[type="text"], input:not([type="hidden"])');
            if (input && (input as HTMLInputElement).value) {
              return (input as HTMLInputElement).value;
            }
            parent = parent.parentElement;
          }
        }
      }
      return null;
    });

    console.log(`Reports To: ${reportsTo}`);
    expect(reportsTo).toBeTruthy();
    expect(reportsTo?.length).toBeGreaterThan(0);

    // Additional validation
    expect(yearsOfService).not.toBe('');
    expect(reportsTo).not.toBe('');
    
    console.log('✓ ESS workspace test passed - Employee data retrieved successfully');
    console.log(`  - Years of Service: ${yearsOfService}`);
    console.log(`  - Reports To: ${reportsTo}`);
  });
});
