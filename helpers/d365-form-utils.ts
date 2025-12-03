// helpers/d365-form-utils.ts
/**
 * D365 F&O Form Data Extraction Utilities
 * 
 * Reusable helper functions for extracting data from D365 forms
 * based on proven patterns from ESS workspace testing.
 */

import { Page } from '@playwright/test';

/**
 * Extract a text field value by label text
 * Works for both editable inputs and read-only display fields
 * 
 * @param page - Playwright page object
 * @param labelText - The label text to search for (case-insensitive)
 * @returns The field value (from input or text content) or null if not found
 * 
 * @example
 * const yearsOfService = await extractFieldValue(page, 'Years of Service');
 * const manager = await extractFieldValue(page, 'Reports to');
 */
export async function extractFieldValue(
  page: Page, 
  labelText: string
): Promise<string | null> {
  return await page.evaluate((searchText: string) => {
    const labels = document.querySelectorAll('label');
    
    for (let label of labels) {
      if (label.textContent?.toLowerCase().includes(searchText.toLowerCase())) {
        const labelId = label.getAttribute('id');
        
        // Strategy 1: Use aria-labelledby to find associated input
        if (labelId) {
          const element = document.querySelector(`[aria-labelledby="${labelId}"]`);
          if (element && (element as any).value) {
            return (element as any).value;
          }
        }

        // Strategy 2: For read-only fields, get text content from parent container
        // Look at the label's parent and following siblings for text content
        let parent = label.parentElement;
        while (parent && parent.tagName !== 'FORM') {
          // Get the text content, excluding the label text itself
          const fullText = parent.textContent?.trim() || '';
          const labelText_ = label.textContent?.trim() || '';
          
          // Remove the label text from the full text
          let displayValue = fullText.replace(labelText_, '').trim();
          
          // If we found text that looks like a value (not empty or just whitespace)
          if (displayValue && displayValue.length > 0 && displayValue.length < 500) {
            // Clean up common patterns (remove extra spaces, newlines)
            displayValue = displayValue.replace(/\s+/g, ' ').trim();
            
            // Make sure it's not just form helper text
            if (!displayValue.includes('Please') && !displayValue.includes('Select') && displayValue.length > 0) {
              return displayValue;
            }
          }
          
          parent = parent.parentElement;
        }

        // Strategy 3: Look for input element in parent containers
        parent = label.parentElement;
        while (parent && parent.tagName !== 'FORM') {
          const input = parent.querySelector('input[type="text"]:not([type="hidden"]), input:not([type="hidden"], [type="checkbox"], [type="radio"]), select, textarea');
          if (input && (input as HTMLInputElement).value) {
            return (input as HTMLInputElement).value;
          }
          parent = parent.parentElement;
        }
      }
    }
    
    return null;
  }, labelText);
}

/**
 * Extract all form field values as key-value pairs
 * Works for both editable inputs and read-only display fields
 * 
 * @param page - Playwright page object
 * @returns Object with label text as keys and field values as values
 * 
 * @example
 * const allData = await extractAllFormFields(page);
 * console.log(allData); 
 * // { 'Personnel number': 'PN000357', 'Years of service': '6.8', ... }
 */
export async function extractAllFormFields(
  page: Page
): Promise<Record<string, string | null>> {
  return await page.evaluate(() => {
    const data: Record<string, string | null> = {};
    const labels = document.querySelectorAll('label');

    labels.forEach((label) => {
      const labelText = label.textContent?.trim();
      if (!labelText || labelText.length === 0 || labelText.length > 200) return;

      let value: string | null = null;
      const labelId = label.getAttribute('id');

      // Strategy 1: Use aria-labelledby to find associated input
      if (labelId) {
        const element = document.querySelector(`[aria-labelledby="${labelId}"]`);
        if (element && (element as any).value) {
          value = (element as any).value;
        }
      }

      // Strategy 2: For read-only fields, extract text content
      if (!value) {
        let parent = label.parentElement;
        for (let level = 0; level < 4 && parent; level++) {
          const fullText = parent.textContent?.trim() || '';
          let displayValue = fullText.replace(labelText, '').trim();
          displayValue = displayValue.replace(/\s+/g, ' ').trim();

          // Clean up multi-label containers (remove secondary labels/fields)
          // If we get too much text, take only the first line or until next known keyword
          if (displayValue.length > 200) {
            const firstLine = displayValue.split('\n')[0].trim();
            const parts = displayValue.split(/(?:Personnel number|Worker name|Title|Name|Worker type|Position|Employee|FULLTIME)/i);
            displayValue = (parts[0] || displayValue).trim();
          }

          if (
            displayValue &&
            displayValue.length > 0 &&
            displayValue.length < 200 &&
            !displayValue.includes('Please') &&
            !displayValue.includes('Select') &&
            !displayValue.includes('Edit personal')
          ) {
            value = displayValue;
            break;
          }

          parent = parent.parentElement;
        }
      }

      // Strategy 3: Look for input element (fallback)
      if (!value) {
        let parent = label.parentElement;
        while (parent && parent.tagName !== 'FORM') {
          const input = parent.querySelector(
            'input[type="text"]:not([type="hidden"]), input:not([type="hidden"], [type="checkbox"], [type="radio"]), select, textarea'
          );
          if (input) {
            value = (input as any).value || input.textContent?.trim() || null;
            if (value) break;
          }
          parent = parent.parentElement;
        }
      }

      data[labelText] = value;
    });

    return data;
  });
}

/**
 * Extract multiple field values at once
 * 
 * @param page - Playwright page object
 * @param fieldLabels - Array of label texts to extract
 * @returns Object with field labels mapped to their values
 * 
 * @example
 * const fields = await extractMultipleFields(page, [
 *   'Years of Service',
 *   'Reports to',
 *   'Position type'
 * ]);
 * // { 'Years of Service': 'PN000357', 'Reports to': 'PN000357', ... }
 */
export async function extractMultipleFields(
  page: Page,
  fieldLabels: string[]
): Promise<Record<string, string | null>> {
  const results: Record<string, string | null> = {};

  for (const label of fieldLabels) {
    results[label] = await extractFieldValue(page, label);
  }

  return results;
}

/**
 * Wait for a specific field to appear and have a value
 * 
 * @param page - Playwright page object
 * @param labelText - The label text to wait for
 * @param timeout - Wait timeout in milliseconds
 * @returns The field value when it appears
 * 
 * @example
 * const yearsValue = await waitForFieldValue(page, 'Years of Service', 10000);
 */
export async function waitForFieldValue(
  page: Page,
  labelText: string,
  timeout: number = 10000
): Promise<string> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const value = await extractFieldValue(page, labelText);
    if (value) {
      return value;
    }
    // Wait a bit before retrying
    await page.waitForTimeout(500);
  }

  throw new Error(
    `Timeout waiting for field "${labelText}" to have a value after ${timeout}ms`
  );
}

/**
 * Navigate to a D365 workspace and wait for it to fully load
 * 
 * @param page - Playwright page object
 * @param menuItem - The mi= parameter value (e.g., 'HcmEmployeeSelfServiceWorkspace')
 * @param company - The cmp= parameter value (default: '4415')
 * 
 * @example
 * await navigateToWorkspace(page, 'HcmEmployeeSelfServiceWorkspace');
 */
export async function navigateToWorkspace(
  page: Page,
  menuItem: string,
  company: string = '4415'
): Promise<void> {
  console.log(`Navigating to workspace: ${menuItem}`);
  
  await page.goto(`/?cmp=${company}&mi=${menuItem}`, {
    waitUntil: 'networkidle',
  });

  // Layer 1: DOM loaded
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  // Layer 2: Content visible
  console.log('Waiting for workspace content...');
  await page.locator('[role="main"]').first().waitFor({
    timeout: 45000,
  });

  // Layer 3: Dynamic rendering
  await page.waitForTimeout(2000);
  
  console.log('Workspace loaded successfully');
}

/**
 * Get debugging information about the current form
 * 
 * @param page - Playwright page object
 * @returns Object with page structure information
 * 
 * @example
 * const debug = await getFormDebugInfo(page);
 * console.log(debug);
 * // { labelCount: 18, inputCount: 7, iframeCount: 0, ... }
 */
export async function getFormDebugInfo(
  page: Page
): Promise<Record<string, any>> {
  return await page.evaluate(() => {
    return {
      labelCount: document.querySelectorAll('label').length,
      inputCount: document.querySelectorAll('input').length,
      selectCount: document.querySelectorAll('select').length,
      iframeCount: document.querySelectorAll('iframe').length,
      formCount: document.querySelectorAll('form, [role="form"]').length,
      allLabels: Array.from(document.querySelectorAll('label'))
        .map((l) => l.textContent?.trim())
        .filter((t) => t && t.length > 0),
    };
  });
}

/**
 * Assert that a field exists and contains a value
 * 
 * @param page - Playwright page object
 * @param fieldLabel - The label text
 * @param expectedValuePattern - Optional regex pattern the value should match
 * 
 * @example
 * await assertFieldExists(page, 'Years of Service');
 * await assertFieldExists(page, 'Personnel number', /^PN\d+$/);
 */
export async function assertFieldExists(
  page: Page,
  fieldLabel: string,
  expectedValuePattern?: RegExp
): Promise<void> {
  const value = await extractFieldValue(page, fieldLabel);

  if (!value) {
    throw new Error(`Field "${fieldLabel}" not found or has no value`);
  }

  if (expectedValuePattern && !expectedValuePattern.test(value)) {
    throw new Error(
      `Field "${fieldLabel}" value "${value}" does not match pattern ${expectedValuePattern}`
    );
  }
}

/**
 * Create a test dataset by extracting multiple related fields
 * Useful for data validation and comparison tests
 * 
 * @param page - Playwright page object
 * @param category - Optional category name for the data
 * @returns Object containing all extracted form data
 * 
 * @example
 * const employeeData = await createTestDataset(page, 'Employee ESS');
 * console.log(employeeData);
 */
export async function createTestDataset(
  page: Page,
  category?: string
): Promise<{
  category?: string;
  timestamp: string;
  data: Record<string, string | null>;
}> {
  return {
    category,
    timestamp: new Date().toISOString(),
    data: await extractAllFormFields(page),
  };
}
