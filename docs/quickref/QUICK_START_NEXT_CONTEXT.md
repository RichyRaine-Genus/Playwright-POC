# Quick Start — New Context Window Guide
---
title: "Quick Start — New Context Window Guide"
summary: "Short, actionable steps for bringing a new context window up to speed and converting ADO HR tests."
tags: ["quickstart","context","howto"]
updated: "2025-12-03"
---

**Read this first** when starting a fresh context window for HR Functional Shakedown testing.

---

## 📋 Current Status (Nov 19, 2025)

✅ **3 tests converted and passing**:
- `id-41504-mss-navigation.spec.ts` (ESS/Manager workspace)
- `id-41505-people-navigation.spec.ts` (People Hub)
- `id-41506-address-changes.spec.ts` (Address changes tile)

⏳ **Next**: Convert remaining ~17 tests from ADO ID-58642

---

## 🎯 One-Minute Summary

**Goal**: Convert ADO test cases from ID-58642 (HR Functional Shakedown) to Playwright automation.

**Approach**: Keep tests simple, use direct URLs where possible, verify with text assertions.

**Pattern**:
```typescript
test('ADO #XXXXX: Description @hr @critical @navigation', async ({ page }) => {
  // 1. Navigate
  await navigateToWorkspace(page, 'MiValue');
  
  // 2. Act (click, fill, etc.)
  await page.locator('text=Something').click();
  
  // 3. Verify
  await expect(page.locator('[role="main"]')).toContainText('Expected text');
  
  // 4. Screenshot
  await page.screenshot({ path: 'test-results/id-xxxxx-description.png' });
});
```

---

## 📚 Essential Reading (5 min)

Before converting a test, read:

1. **`CONVERSION_PROGRESS.md`** (this directory) — Full progress report, learnings, next steps
2. **`docs/D365_URL_GLOSSARY.md`** — List of all known workspace URLs (mi=HcmXxx)
3. **`.github/copilot-instructions.md`** — Framework rules and patterns
4. **`ADO_TO_PLAYWRIGHT_CONVERSION_GUIDE.md`** — How to convert ADO steps to Playwright

---

## 🛠 Quick Reference: Test Structure

### File Naming
- `tests/id-XXXXX-description.spec.ts`
- Example: `id-41506-address-changes.spec.ts`

### File Template (30 lines max)
```typescript
import { test, expect } from '@playwright/test';
import { navigateToWorkspace } from '../helpers/d365-form-utils';

test('ADO #XXXXX: Title @hr @critical @navigation', async ({ page }) => {
  test.setTimeout(120000);

  // Navigation
  await navigateToWorkspace(page, 'HcmWorkforceWorkspace');

  // Action
  await page.locator('text=Address changes').click();
  await page.waitForLoadState('networkidle');

  // Verify
  const main = page.locator('[role="main"]').first();
  await expect(main).toContainText('Worker');

  // Screenshot
  await page.screenshot({ path: 'test-results/id-xxxxx-description.png' });
});
```

---

## ✅ Checklist: Before Converting a Test

- [ ] Identify the ADO test ID and title
- [ ] Check `D365_URL_GLOSSARY.md` for the workspace `mi=` value
  - If not found, add "TODO: Find direct URL" to the test file comment
  - Use menu navigation as fallback
- [ ] Keep test under 30 lines
- [ ] Use simple locator (text match > data-attributes)
- [ ] Verify with text assertion, not brittle selectors
- [ ] Add screenshot at end
- [ ] Tag with `@hr @<area> @<risk> @<context>`
- [ ] Run locally: `npx playwright test tests/id-xxxxx-description.spec.ts --headed`
- [ ] If passing → commit
- [ ] Update `CONVERSION_PROGRESS.md` with test summary

---

## 🔍 Common Patterns

### Navigation Only (Workspace or Page)
```typescript
// Direct URL known
await navigateToWorkspace(page, 'HcmPeopleHub');

// Then verify
await expect(page.locator('[role="main"]')).toContainText('Workers');
```

### Click a Tile/Button
```typescript
const tile = page.locator('text=Address changes').first();
await tile.click();
await page.waitForLoadState('networkidle');
```

### Fill Form & Extract Data
```typescript
await page.locator('input[aria-label*="Name"]').fill('John Doe');
const fields = await extractAllFormFields(page);
expect(fields['Personnel number']).toBeTruthy();
```

### Verify Grid/Table
```typescript
const grid = page.locator('[role="main"]');
await expect(grid).toContainText('Worker');   // Column header
await expect(grid).toContainText('Address');  // Another column
```

---

## 🐛 Debugging

### Test Fails — Quick Steps
1. **Was it passing before?** → Check recent code changes
2. **Run with `--headed`** → See browser in action
3. **Add console.log** → Print page content or locator count
4. **Check screenshot** → Look at `test-results/id-xxxxx-description.png`
5. **DOM inspection** → In headed browser, open DevTools and inspect
6. **Simplify** → Remove extra assertions, keep core action + verify

### Common Failures
- **"element not found"** → Locator strategy wrong. Try `text=` or plural `.nth(0).first()`
- **"strict mode: 6 elements"** → Multiple matches. Scope to `[role="main"]` or use `.first()`
- **"timeout waiting for navigation"** → Page didn't load. Check URL or wait longer (but 15s should be enough)

---

## 📝 URL Glossary — Current Entries

| Module | Workspace | mi= |
|--------|-----------|-----|
| HR | Employee Self Service (ESS) | HcmEmployeeSelfServiceWorkspace |
| HR | Manager Self Service (MSS) | HcmManagerSelfServiceWorkspace |
| HR | People (Workers Hub) | HcmPeopleHub |
| HR | Personnel Management / Workforce | HcmWorkforceWorkspace |
| Payroll | Compensation Management | CompensationManagementWorkspace |
| Payroll | Ready to Pay | ReadyToPayWorkspace |

**To add**: Find new URLs in browser address bar and update `docs/D365_URL_GLOSSARY.md`

---

## 🚀 Next Test to Convert (Priority)

**Option 1** (recommended): Continue with remaining tests from ID-58642. Ask user which test ID next.

**Option 2**: Convert all navigation/workspace tests first (easiest), then form entry, then data extraction.

---

## 📞 If Stuck

1. Review `CONVERSION_PROGRESS.md` for learnings from ID-41504/41505/41506
2. Check `ADO_TO_PLAYWRIGHT_CONVERSION_GUIDE.md` for ADO→Playwright mapping
3. Look at existing tests in `tests/` for patterns
4. Simplify: Remove fallback logic, keep core action
5. Ask user for DOM snippet or browser screenshot if selector not found

---

**Ready to convert the next test!** Ask user which ADO test ID to tackle next, get the test steps, and apply the pattern above.
