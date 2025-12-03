// tests/ess-with-helpers.spec.ts
/**
 * Example test using the D365 Form Utilities Helper
 * 
 * This shows how to use the reusable utilities for cleaner,
 * more maintainable test code.
 */

import { test, expect } from '@playwright/test';
import {
  navigateToWorkspace,
  extractFieldValue,
  extractMultipleFields,
  extractAllFormFields,
  getFormDebugInfo,
  createTestDataset,
} from '../helpers/d365-form-utils';

test.describe('D365 Form Utilities - Example Usage', () => {
  test('extract ESS data using helper utilities', async ({ page }) => {
    test.setTimeout(120000);

    // Navigate using helper
    await navigateToWorkspace(page, 'HcmEmployeeSelfServiceWorkspace');

    // Extract single field
    console.log('\n--- Single Field Extraction ---');
    const yearsOfService = await extractFieldValue(page, 'Years of Service');
    console.log(`Years of Service: ${yearsOfService}`);
    expect(yearsOfService).toBeTruthy();

    // Extract multiple fields at once
    console.log('\n--- Multiple Fields Extraction ---');
    const fields = await extractMultipleFields(page, [
      'Years of Service',
      'Reports to',
      'Personnel number',
      'Position type',
    ]);
    console.log('Extracted fields:', JSON.stringify(fields, null, 2));

    // Extract all fields
    console.log('\n--- All Fields Extraction ---');
    const allData = await extractAllFormFields(page);
    console.log('All form data:', JSON.stringify(allData, null, 2));

    // Get debug info
    console.log('\n--- Form Debug Information ---');
    const debugInfo = await getFormDebugInfo(page);
    console.log('Form structure:', {
      labels: debugInfo.labelCount,
      inputs: debugInfo.inputCount,
      selects: debugInfo.selectCount,
      iframes: debugInfo.iframeCount,
    });
    console.log('All labels:', debugInfo.allLabels);

    // Create a test dataset
    console.log('\n--- Test Dataset ---');
    const dataset = await createTestDataset(page, 'Employee Self Service');
    console.log('Dataset:', JSON.stringify(dataset, null, 2));

    // Assertions
    expect(yearsOfService).not.toBe('');
    expect(fields['Reports to']).toBeTruthy();
    expect(Object.keys(allData).length).toBeGreaterThan(0);
  });

  test('compare data extraction methods', async ({ page }) => {
    test.setTimeout(120000);

    await navigateToWorkspace(page, 'HcmEmployeeSelfServiceWorkspace');

    // Method 1: Extract specific field
    const method1Start = Date.now();
    const yearsSpecific = await extractFieldValue(page, 'Years of Service');
    const method1Time = Date.now() - method1Start;

    // Method 2: Extract all and filter
    const method2Start = Date.now();
    const allData = await extractAllFormFields(page);
    const yearsAll = allData['Years of service'];
    const method2Time = Date.now() - method2Start;

    console.log('\nPerformance Comparison:');
    console.log(`  Single field extraction: ${method1Time}ms -> "${yearsSpecific}"`);
    console.log(`  All fields extraction: ${method2Time}ms -> "${yearsAll}"`);
    console.log(`  All fields are ${
      method1Time < method2Time ? 'faster' : 'slower'
    } (by ${Math.abs(method1Time - method2Time)}ms)`);

    expect(yearsSpecific).toBe(yearsAll);
  });

  test('test data validation scenario', async ({ page }) => {
    test.setTimeout(120000);

    await navigateToWorkspace(page, 'HcmEmployeeSelfServiceWorkspace');

    // Extract and validate employee data
    const fields = await extractMultipleFields(page, [
      'Personnel number',
      'Worker name',
      'Years of Service',
      'Position type',
    ]);

    // Validate personnel number format
    expect(fields['Personnel number']).toMatch(/^PN\d+$/);

    // Validate required fields exist
    expect(fields['Worker name']).toBeTruthy();
    expect(fields['Years of Service']).toBeTruthy();

    // Create audit trail
    const dataset = await createTestDataset(page, 'Data Validation Test');
    console.log('\nValidation passed for:');
    console.log(`  Timestamp: ${dataset.timestamp}`);
    console.log(`  Employee: ${fields['Worker name']}`);
    console.log(`  Personnel #: ${fields['Personnel number']}`);
  });
});
