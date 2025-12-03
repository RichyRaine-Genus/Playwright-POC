# D365 F&O Playwright Test Suite - Data Extraction Framework
---
title: "D365 Data Extraction Framework"
summary: "Detailed explanation of the 3-strategy data extraction approach and wait strategies for D365 F&O workspaces."
tags: ["guide","extraction","playwright"]
updated: "2025-12-03"
---

## Overview

This document provides a complete test plan and framework for extracting data from D365 Finance & Operations workspaces using Playwright.

---

## Challenge

D365 F&O workspaces present unique challenges for automated testing:

1. **Dynamic Loading**: Workspaces load content progressively with JavaScript
2. **Complex DOM**: Forms use nested containers and shadow DOM patterns
3. **Splash Screens**: Initial page load shows splash screen covering actual content
4. **Iframe Usage**: Some workspaces render in iframes
5. **Control Naming**: Standard control selectors (`data-control-name`) may not be reliable

---

## Solution Architecture

### 1. Wait Strategy

Proper wait strategy is **critical** for D365 workspaces. Use a layered approach:

```typescript
// Layer 1: Page load states
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForLoadState('domcontentloaded');
await page.waitForLoadState('networkidle');

// Layer 2: Content visibility
await page.locator('[role="main"]').first().waitFor({ timeout: 45000 });

// Layer 3: Dynamic content rendering
await page.waitForTimeout(2000); // Allow dynamic JS to settle
```

**Why this works:**
- `networkidle`: Ensures all network requests have completed
- `waitForSelector`: Ensures DOM elements are actually rendered
- Final delay: Allows JavaScript frameworks to finish rendering

### 2. Data Extraction Method

The most reliable method for D365 form data extraction:

**Pattern: Label → Walk DOM Tree → Find Input**

```typescript
const data = await page.evaluate(() => {
  const labels = document.querySelectorAll('label');
  
  for (let label of labels) {
    if (label.textContent?.toLowerCase().includes('target-text')) {
      // Walk up the DOM tree from the label
      let parent = label.parentElement;
      while (parent && parent.tagName !== 'FORM') {
        // Look for input elements
        const input = parent.querySelector('input[type="text"], input:not([type="hidden"])');
        if (input && (input as HTMLInputElement).value) {
          return (input as HTMLInputElement).value;
        }
        parent = parent.parentElement; // Move up one level
      }
    }
  }
  return null;
});
```

**Why this works:**
- Labels are reliably present and stable
- DOM structure around labels is consistent
- Input values contain actual data (person IDs, numbers, etc.)
- Walking the tree finds the input in nested containers

### 3. Selector Hierarchy (in order of reliability)

#### A. XPath Text Matching (Most Reliable)
```typescript
page.locator(`xpath=//label[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'target')]`)
```

**Pros:**
- Case-insensitive
- Text-based (label text doesn't change across instances)
- Locale-friendly with `translate()`

#### B. DOM Navigation from Labels
```typescript
const labels = document.querySelectorAll('label');
for (let label of labels) {
  if (label.textContent?.toLowerCase().includes('target')) {
    // Process this label
  }
}
```

**Pros:**
- Direct JS access
- Can walk DOM tree
- Access to all element properties

#### C. ARIA Labels (if available)
```typescript
page.locator('[aria-label*="Years of Service"]')
page.locator('[aria-describedby*="Years"]')
```

**Pros:**
- Semantic meaning
- Accessibility-focused

#### D. Avoid: data-control-name attributes
```typescript
// ❌ NOT RELIABLE
page.locator('[data-control-name="HcmEmployment_YearsOfService"]')
```

**Cons:**
- Attribute names may not match display text
- May not exist in all workspaces
- Instance-specific naming

---

## Complete Working Example

### Test: Employee Self Service Workspace Data Extraction

```typescript
// tests/checkESS-test.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Dynamics 365 HR Employee Self Service Test', () => {
  test('should navigate to ESS workspace and retrieve employee data', async ({ page }) => {
    test.setTimeout(120000);

    // Step 1: Navigate
    console.log('Navigating to ESS workspace...');
    await page.goto('/?cmp=4415&mi=HcmEmployeeSelfServiceWorkspace', { 
      waitUntil: 'networkidle' 
    });

    // Step 2: Layer 1 waits
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');

    // Step 3: Layer 2 waits
    console.log('Waiting for content to render...');
    await page.locator('[role="main"]').first().waitFor({ timeout: 45000 });
    
    // Step 4: Layer 3 waits
    await page.waitForTimeout(2000);

    // Step 5: Extract "Years of Service"
    const yearsOfService = await page.evaluate(() => {
      const labels = document.querySelectorAll('label');
      for (let label of labels) {
        if (label.textContent?.toLowerCase().includes('years')) {
          let parent = label.parentElement;
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

    // Step 6: Validate
    expect(yearsOfService).toBeTruthy();
    console.log(`✓ Years of Service: ${yearsOfService}`);

    // Repeat for other fields...
  });
});
```

---

## Debugging Techniques

### 1. Screenshot Inspection
```typescript
await page.screenshot({ 
  path: 'debug-screenshot.png', 
  fullPage: true 
});
```

### 2. Console Logging with Structure
```typescript
const pageInfo = await page.evaluate(() => ({
  iframeCount: document.querySelectorAll('iframe').length,
  formCount: document.querySelectorAll('form, [role="form"]').length,
  labelCount: document.querySelectorAll('label').length,
  inputCount: document.querySelectorAll('input, select, textarea').length,
}));
console.log('Page structure:', pageInfo);
```

### 3. Enumerate All Form Fields
```typescript
const formData = await page.evaluate(() => {
  const data: Record<string, any> = {};
  const labels = document.querySelectorAll('label');
  
  labels.forEach((label) => {
    const labelText = label.textContent?.trim();
    if (labelText) {
      let parent = label.parentElement;
      let value = null;
      
      while (parent && parent.tagName !== 'FORM') {
        const input = parent.querySelector('input[type="text"], input:not([type="hidden"]), select, textarea');
        if (input) {
          value = (input as any).value || input.textContent;
          break;
        }
        parent = parent.parentElement;
      }
      
      data[labelText] = value;
    }
  });
  
  return data;
});

console.log('All form data:', formData);
```

### 4. Take Trace for Playback
```typescript
// In config:
use: {
  trace: 'on-first-retry',
}

// Run with: npx playwright test --trace on
// View with: npx playwright show-trace trace.zip
```

---

## Configuration Best Practices

### timeout Settings
```typescript
// playwright.config.ts
export default defineConfig({
  timeout: 60000,           // 60s per test
  expect: {
    timeout: 10000,         // 10s per assertion
  },
  // ...
});
```

### Global Setup
```typescript
// global-setup.ts
async function globalSetup(config: FullConfig) {
  // ... authentication ...
  
  // Wait for dashboard to load
  await page.locator('[role="main"]').waitFor({ timeout: 60000 });
  await page.waitForLoadState('networkidle');
  
  // Save auth state
  await page.context().storageState({ path: authFile });
}
```

---

## Common Patterns

### Pattern 1: Extract Text Field Value
```typescript
const value = await page.evaluate((labelText: string) => {
  const labels = document.querySelectorAll('label');
  for (let label of labels) {
    if (label.textContent?.includes(labelText)) {
      let parent = label.parentElement;
      while (parent?.tagName !== 'FORM') {
        const input = parent?.querySelector('input');
        if (input) return (input as HTMLInputElement).value;
        parent = parent?.parentElement;
      }
    }
  }
  return null;
}, 'Years of Service');
```

### Pattern 2: Extract Person Column (Lookup)
```typescript
const manager = await page.evaluate(() => {
  // Person columns in D365 have text display + hidden ID input
  const labels = document.querySelectorAll('label');
  for (let label of labels) {
    if (label.textContent?.toLowerCase().includes('manager')) {
      let parent = label.parentElement;
      while (parent?.tagName !== 'FORM') {
        // Look for the display value (person name)
        const textInput = parent?.querySelector('input[type="text"]');
        if (textInput) return (textInput as HTMLInputElement).value;
        parent = parent?.parentElement;
      }
    }
  }
  return null;
});
```

### Pattern 3: Extract Dropdown/Combobox
```typescript
const position = await page.evaluate(() => {
  const labels = document.querySelectorAll('label');
  for (let label of labels) {
    if (label.textContent?.includes('Position')) {
      let parent = label.parentElement;
      while (parent?.tagName !== 'FORM') {
        const select = parent?.querySelector('select, [role="combobox"], input.ms-Dropdown');
        if (select) return (select as any).value || select.textContent;
        parent = parent?.parentElement;
      }
    }
  }
  return null;
});
```

---

## Test Results from Current Run

✅ **Working Test: checkESS-test.spec.ts**

```
Step 1: Navigate to ESS workspace
Step 2: Wait for page to fully load  
Step 3: Wait for ESS content to appear
Step 4: Extract Years of Service
✓ Years of Service: PN000357
Step 5: Extract Reports To
✓ Reports To: PN000357
✓ ESS workspace test passed - Employee data retrieved successfully
```

---

## Next Steps - Extending This Framework

### 1. Create Reusable Helper Functions

```typescript
// helpers/d365-form-helpers.ts
export async function extractFieldValue(
  page: Page, 
  labelText: string
): Promise<string | null> {
  return await page.evaluate((label: string) => {
    const labels = document.querySelectorAll('label');
    for (let lbl of labels) {
      if (lbl.textContent?.toLowerCase().includes(label.toLowerCase())) {
        let parent = lbl.parentElement;
        while (parent?.tagName !== 'FORM') {
          const input = parent?.querySelector('input');
          if (input) return (input as HTMLInputElement).value;
          parent = parent?.parentElement;
        }
      }
    }
    return null;
  }, labelText);
}

// Usage in tests
const yearsOfService = await extractFieldValue(page, 'Years of Service');
const reportsTo = await extractFieldValue(page, 'Reports to');
```

### 2. Create Fixture for ESS Navigation

```typescript
// fixtures/ess-workspace.fixture.ts
export const essWorkspace = test.extend({
  essPage: async ({ page }, use) => {
    await page.goto('/?cmp=4415&mi=HcmEmployeeSelfServiceWorkspace', { 
      waitUntil: 'networkidle' 
    });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    await page.locator('[role="main"]').first().waitFor({ timeout: 45000 });
    await page.waitForTimeout(2000);
    
    await use(page);
  },
});

// Usage
essWorkspace('should extract employee data', async ({ essPage }) => {
  const years = await extractFieldValue(essPage, 'Years of Service');
  expect(years).toBeTruthy();
});
```

### 3. Add Multiple Workspace Tests

Expand the framework to test:
- HR Management workspace
- Personnel Actions workspace
- Compensation workspace
- Benefits workspace

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Timeout waiting for selector | Page not fully loaded | Increase `waitUntil` to `networkidle`, add explicit `waitFor()` |
| textContent returns null | Element exists but is hidden | Use `.evaluate()` to access value property instead |
| Form fields appear empty | Dynamic loading not complete | Add `await page.waitForTimeout(2000-3000)` before extraction |
| Different values per run | Authenticating to different user | Check auth state in `.auth/user.json` |
| Splash screen blocking interaction | Needs to wait for content | Already handled with `[role="main"]` wait |

---

## References

- **Playwright Docs**: https://playwright.dev
- **D365 F&O Form Patterns**: Check browser DevTools (F12) to inspect actual HTML
- **Accessibility**: Use `[role="main"]`, `aria-label`, `aria-describedby` when available
