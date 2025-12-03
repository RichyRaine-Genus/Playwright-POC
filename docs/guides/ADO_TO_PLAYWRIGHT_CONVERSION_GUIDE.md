# ADO Test to Playwright Conversion Guide
---
title: "ADO to Playwright Conversion Guide"
summary: "Patterns and best practices to convert ADO test cases to Playwright tests for D365 F&O."
tags: ["guide","conversion","playwright"]
updated: "2025-12-03"
---

## Overview

This guide provides best practices for converting ADO (Azure DevOps) manual test cases to Playwright automation, specifically for D365 F&O applications.

---

## Key Conversion Principles

### 1. One ADO Test Case = One Playwright Test

```typescript
// ADO Test Case #41908: "Validating an employee for ready to pay"
test('ADO #41908: Validate an employee for ready to pay', async ({ page }) => {
  // Implementation here
});
```

**Why**: Maintains 1:1 traceability to ADO test plans for reporting and coverage tracking.

### 2. Test Steps → Code Flow

Each ADO "Test Step" maps to a logical code block:

| ADO Element | Playwright Code | Example |
|-------------|-----------------|---------|
| **Test Action** | Navigation or interaction | `await page.goto(url)` or `await page.locator('text=Button').click()` |
| **Expected Result** | Assertion or wait verification | `await expect(element).toBeVisible()` |
| **UI Verification** | Screenshot or element check | `expect(await page.screenshot()).toMatchSnapshot()` |

### 3. Navigation Pattern

Most ADO test cases start with navigation through the menu structure. Optimize this:

```typescript
// ❌ AVOID: Clicking through multiple menu items (slow, fragile)
await page.locator('text=Menu').click();
await page.locator('text=Human Resources').click();
await page.locator('text=Workers').click();

// ✅ PREFER: Direct URL navigation with query parameters
await page.goto('/?cmp=4415&mi=HcmWorkerListPage', { waitUntil: 'networkidle' });
```

**Why**: Direct URLs are faster and more reliable. Extract the URL pattern from D365 navigation.

### 4. Use Three-Layer Wait Strategy

Every test must include the proven D365 wait pattern:

```typescript
test('Example test', async ({ page }) => {
  test.setTimeout(120000); // Set test timeout for D365 workspaces

  // Navigate with networkidle
  await page.goto(url, { waitUntil: 'networkidle' });
  
  // Layer 1: Page load states
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  
  // Layer 2: Content visibility
  await page.locator('[role="main"]').first().waitFor({ timeout: 45000 });
  
  // Layer 3: Dynamic rendering
  await page.waitForTimeout(2000);
  
  // Now safe to interact with page
});
```

---

## Selector Strategy for ADO Actions

### Priority Order for Finding Elements

1. **Label Text** (Most Reliable)
   ```typescript
   // For fields with associated labels
   await page.locator('label:has-text("Worker")').click();
   ```

2. **Button/Link Text**
   ```typescript
   // For buttons, links, tabs
   await page.locator('button:has-text("Validate")').click();
   await page.locator('text=Payroll').click();
   ```

3. **ARIA Attributes**
   ```typescript
   // For accessibility-marked elements
   await page.locator('[aria-label*="Search"]').fill('value');
   ```

4. **Role-Based Locators**
   ```typescript
   // For semantic elements
   await page.locator('[role="main"]').first().waitFor();
   ```

5. **Data Attributes** (Last Resort)
   ```typescript
   // Only if nothing else works
   await page.locator('[data-test-id="worker-form"]').click();
   ```

---

## Converting Common ADO Patterns

### Pattern 1: Multi-Step Navigation

**ADO Steps:**
```
1. Click the menu → Menu expands
2. Click Module "Human resources" → Menu expands
3. Select "Workers" → Workers Expands
4. Select the worker required → Worker is selected
```

**Playwright Code:**
```typescript
console.log('Steps 1-3: Navigate to Workers');
await page.goto('/?cmp=4415&mi=HcmWorkerListPage', { waitUntil: 'networkidle' });
await page.waitForLoadState('domcontentloaded');
await page.waitForLoadState('networkidle');
await page.locator('[role="main"]').first().waitFor({ timeout: 45000 });

console.log('Step 4: Select worker from list');
await page.locator('text=Richard Anthony Raine').click();
await page.waitForLoadState('networkidle');
```

### Pattern 2: Form Field Interaction + Validation

**ADO Steps:**
```
1. Enter value in field → Field contains value
2. Click Save → Confirmation shown
```

**Playwright Code:**
```typescript
console.log('Step 1: Enter value in field');
await page.locator('input[aria-label="Field Name"]').fill('New Value');

console.log('Step 2: Click Save');
await page.locator('button:has-text("Save")').click();
await page.waitForLoadState('networkidle');

console.log('Verification: Confirmation message displayed');
const confirmation = page.locator('text=/saved|successfully|confirmed/i');
await confirmation.waitFor({ timeout: 10000 });
await expect(confirmation).toBeVisible();
```

### Pattern 3: Verification Without Interaction

**ADO Steps:**
```
1. View page → Content displays
2. Verify element A is visible
```

**Playwright Code:**
```typescript
console.log('Step 1: Navigate to view');
await page.goto('/?cmp=4415&mi=ViewPage', { waitUntil: 'networkidle' });
await page.waitForLoadState('networkidle');
await page.locator('[role="main"]').first().waitFor({ timeout: 45000 });

console.log('Verification: Expected content is visible');
const content = page.locator('text=Expected Element');
await expect(content).toBeVisible();

// Or extract and verify content
const text = await page.locator('[role="main"]').textContent();
expect(text).toContain('Expected Text');
```

---

## Using Helper Functions for Data Extraction

Your framework includes helper functions that simplify data extraction. Use them instead of writing custom extraction code:

### For Single Field Extraction

```typescript
import { extractFieldValue } from '../helpers/d365-form-utils';

const yearsOfService = await extractFieldValue(page, 'Years of Service');
expect(yearsOfService).toBeTruthy();
```

### For Multi-Field Extraction

```typescript
import { extractAllFormFields } from '../helpers/d365-form-utils';

const allData = await extractAllFormFields(page);
console.log('Extracted data:', allData);

// Verify specific fields
expect(allData['Worker name']).toBe('John Doe');
expect(allData['Position type']).toBe('FULLTIME');
```

### Creating New Domain-Specific Helpers

For repeated validation logic, add helpers to `helpers/d365-form-utils.ts`:

```typescript
/**
 * Validate that a worker is ready to pay
 * @param page - Playwright page object
 * @returns true if validation passes, false otherwise
 */
export async function validateWorkerReady(page: Page): Promise<boolean> {
  const status = await extractFieldValue(page, 'Ready to Pay Status');
  return status?.toLowerCase().includes('ready') ?? false;
}
```

Then use in tests:

```typescript
import { validateWorkerReady } from '../helpers/d365-form-utils';

const isReady = await validateWorkerReady(page);
expect(isReady).toBe(true);
```

---

## Console Logging for Test Observability

Maintain detailed console logging like existing tests. This aids debugging:

```typescript
console.log('Step 1: Navigate to page');
console.log('Step 2: Click button');
console.log('Verification: Check result');
console.log('✓ Test passed');
```

Output example:
```
Step 1: Navigate to Workers
Step 2: Select worker
Step 3: Click Payroll tab
Step 4: Click Validate
Verification: Confirmation message displayed
✓ Validation confirmation displayed
```

---

## Handling External Dependencies

Some ADO test steps cannot be automated in Playwright (e.g., Sharepoint file verification, external API calls).

**Approach**: Document as TODO comments:

```typescript
// Step 6: Check in Sharepoint that the file is generated
// TODO: Add integration test for Sharepoint file verification
// This requires:
// - Sharepoint API credentials in .env
// - Separate integration test suite
// - Or: Manual verification step documented in run book
```

---

## File Organization for ADO Tests

### Naming Convention

```
tests/
├── payroll-ready-to-pay-test.spec.ts      # ADO #41908-41916
├── compensation-management-test.spec.ts   # ADO #41920-41930
└── worker-management-test.spec.ts         # ADO #41900-41907
```

**Pattern**: `{domain}-{feature}-test.spec.ts`

### Test Naming Convention

```typescript
// Include ADO ID for traceability
test('ADO #41908: Validate an employee for ready to pay', async ({ page }) => { ... });
test('ADO #41909: View ready to pay validation results', async ({ page }) => { ... });
```

---

## Running and Debugging

### Run All Payroll Tests

```powershell
npx playwright test payroll-ready-to-pay-test.spec.ts
```

### Run Specific Test

```powershell
npx playwright test payroll-ready-to-pay-test.spec.ts -g "ADO #41908"
```

### Debug Mode

```powershell
npx playwright test payroll-ready-to-pay-test.spec.ts --debug
```

### View Results

```powershell
npx playwright show-report
```

---

## Checklist: Before Converting ADO Test

- [ ] **Read ADO test steps** - Understand the complete workflow
- [ ] **Extract D365 navigation URL** - Identify the workspace/form being tested
- [ ] **Identify all actions** - Click, enter data, select from list, etc.
- [ ] **Identify all verifications** - Visual checks, data validation, messages
- [ ] **Check for external dependencies** - External systems, APIs, file storage
- [ ] **Plan data setup** - What worker/data is needed? Can we query D365 API?
- [ ] **Add meaningful console.log** - Describe each step for debugging
- [ ] **Include three-layer wait strategy** - Non-negotiable for D365
- [ ] **Use helper functions** - Reduce code duplication
- [ ] **Write assertions, not just actions** - Verify expected behavior
- [ ] **Add ADO test ID to test name** - Maintain traceability
- [ ] **Test locally before committing** - Run the test to verify it works

---

## Common Mistakes to Avoid

| Mistake | Impact | Fix |
|---------|--------|-----|
| Missing wait layers | Flaky tests, random failures | Use three-layer strategy |
| Clicking menu items instead of direct URL | Slow tests, brittle selectors | Extract D365 URL parameters |
| Only checking for element visibility | Missed validation logic | Add explicit assertions |
| Hard-coded test data | Tests fail if data changes | Use data extracted from D365 |
| No console.log statements | Hard to debug failures | Add descriptive logging |
| Using `data-control-name` selectors | Selectors break across instances | Use label text or ARIA attributes |
| Forgetting `waitForLoadState('networkidle')` | D365 content not fully loaded | Always include all three wait layers |

---

## Example: Converting a Complex ADO Test

### Original ADO Test Case

```
Test: "Complex Worker Profile Update"

Step 1: Navigate to Workers form → Form loads
Step 2: Search for worker "PN000357" → Worker record appears
Step 3: Click "Edit" button → Form enters edit mode
Step 4: Change "Title" field to "Senior Analyst" → Field value updated
Step 5: Change "Department" dropdown to "IT" → Dropdown selection updated
Step 6: Click "Save" button → Record saved (confirmation shown)
Step 7: Return to list and verify worker has new title → Updated title visible in list
```

### Converted Playwright Test

```typescript
test('ADO #41950: Complex Worker Profile Update', async ({ page }) => {
  test.setTimeout(120000);

  console.log('Steps 1-2: Navigate to Workers and search for PN000357');
  await page.goto('/?cmp=4415&mi=HcmWorkerListPage', { waitUntil: 'networkidle' });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.locator('[role="main"]').first().waitFor({ timeout: 45000 });
  await page.waitForTimeout(2000);

  // Search for worker
  await page.locator('input[aria-label*="Search"]').fill('PN000357');
  await page.locator('text=Richard Anthony Raine').click();
  await page.waitForLoadState('networkidle');

  console.log('Step 3: Click Edit button');
  await page.locator('button:has-text("Edit")').click();
  await page.waitForLoadState('networkidle');

  console.log('Step 4: Update Title field');
  await page.locator('input[aria-label*="Title"]').fill('Senior Analyst');

  console.log('Step 5: Update Department dropdown');
  await page.locator('select[aria-label*="Department"]').selectOption('IT');

  console.log('Step 6: Click Save');
  await page.locator('button:has-text("Save")').click();
  await page.waitForLoadState('networkidle');

  // Verify save confirmation
  const confirmation = page.locator('text=/saved|successfully|confirmed/i');
  await confirmation.waitFor({ timeout: 10000 });
  await expect(confirmation).toBeVisible();

  console.log('Step 7: Return to list and verify updated title');
  await page.locator('button[aria-label*="back"]').click();
  await page.waitForLoadState('networkidle');

  // Verify the updated title is visible in the list
  const updatedWorker = page.locator('text=Richard Anthony Raine').locator('text=Senior Analyst');
  await expect(updatedWorker).toBeVisible();
  console.log('✓ Worker profile successfully updated');
});
```

---

## Next Steps

1. **Create test files** for each ADO test case group
2. **Add TODO comments** for steps that need locator investigation
3. **Run in --debug mode** to find correct selectors
4. **Use Inspector** to identify element selectors
5. **Iterate on selectors** - Test locally and refine
6. **Create domain-specific helpers** for repeated patterns
7. **Document selector patterns** found for your D365 instance
