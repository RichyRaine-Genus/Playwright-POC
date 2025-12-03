# AI Coding Agent Instructions for D365 F&O Playwright Test Framework

## Project Overview

This is a production-ready Playwright test framework for automated testing of **Dynamics 365 Finance & Operations (D365 F&O)** applications. The framework focuses on reliable data extraction from dynamic web forms, particularly the Employee Self Service (ESS) workspace, and workspace navigation following ADO test plan conversions.

**Key Achievements**: 
- ✅ Extracts employee data with 100% accuracy from D365 forms
- ✅ Successfully converted 3 ADO pilot tests (ID-41504, ID-41505, ID-41506)
- ✅ All 11 tests passing with reliable navigation and data extraction patterns

## Related Guides & Documentation

For additional context, consult:
- **`CONVERSION_PROGRESS.md`** - Current test conversion status, learnings from 3 ADO conversions, DO/DON'T patterns
- **`QUICK_START_NEXT_CONTEXT.md`** - Quick reference for new context windows, debugging tips, common patterns
- **`docs/D365_URL_GLOSSARY.md`** - Complete list of workspace IDs and direct URLs for D365 pages
- **`ADO_TO_PLAYWRIGHT_CONVERSION_GUIDE.md`** - Detailed patterns for converting ADO test steps to Playwright
- **`D365_DATA_EXTRACTION_FRAMEWORK.md`** - Deep dive into the 3-strategy extraction architecture

These documents provide additional practical examples and troubleshooting guidance.

## Architecture & Core Concepts

### 1. Critical Wait Strategy for D365 Workspaces

D365 F&O workspaces are heavily JavaScript-driven with progressive content loading. A three-layer wait strategy is **essential**:

```typescript
// Layer 1: Network activity
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForLoadState('domcontentloaded');
await page.waitForLoadState('networkidle');

// Layer 2: Content visibility
await page.locator('[role="main"]').first().waitFor({ timeout: 45000 });

// Layer 3: Dynamic rendering
await page.waitForTimeout(2000);
```

**Why this matters**: D365 renders content in stages. Skipping any layer causes flaky tests or data extraction failures.

### 2. Data Extraction Pattern: Label → DOM Walk → Value

D365 forms use labels as stable anchors. The proven pattern is:

```typescript
// Find label by text content
// Walk up DOM tree to parent container
// Extract value from input OR text display field
```

**Three parallel strategies** (see `helpers/d365-form-utils.ts` for implementation):

1. **aria-labelledby**: Use label ID to find associated input element
2. **Text extraction**: For read-only fields, clean parent textContent by removing label text
3. **Input search**: Walk parent containers looking for `<input type="text">` or `<select>` elements

**Implementation**: All strategies are implemented in `extractFieldValue()` and `extractAllFormFields()` helper functions. Use these instead of writing inline extraction logic.

### 3. Authentication & Global Setup

- `global-setup.ts` runs before all tests via Playwright's `globalSetup` config
- Saves authentication state to `playwright/.auth/user.json` (cached)
- Handles Azure AD login flow with username/password/confirm prompts
- Waits for `[role="main"]` to ensure dashboard fully loads
- **All subsequent tests reuse cached auth** (`storageState` in config)

**Configuration via `.env` file**:
```
D365_URL=https://your-instance.axcloud.dynamics.com
D365_USERNAME=your-email@company.com
D365_PASSWORD=your-password
```

### 4. Selector Reliability Hierarchy

**DO USE** (in order of preference):
1. `label` elements with `textContent` matching (case-insensitive)
2. XPath with `contains()` and `translate()` for case-insensitive matching
3. ARIA attributes (`aria-labelledby`, `aria-describedby`)

**AVOID**:
- `data-control-name` attributes (unreliable, instance-specific naming)
- Absolute XPath positions (fragile across form variations)
- Shadow DOM piercing (D365 occasionally uses Shadow DOM)

## Project-Specific Patterns

### Workspace Navigation & URL Glossary

D365 workspaces are identified by `mi=<WorkspaceId>` URL parameters. The workspace IDs are documented in `docs/D365_URL_GLOSSARY.md`:
- `HcmEmployeeSelfServiceWorkspace` - Employee Self Service (ESS)
- `HcmPeopleHub` - People workspace
- `HcmWorkforceWorkspace` - Personnel Management / Workforce
- `HcmManagerSelfServiceWorkspace` - Manager Self Service (MSS)

**Always use `navigateToWorkspace(page, '<WorkspaceId>')` helper** instead of manual navigation. This applies the critical three-layer wait strategy automatically and is more reliable than direct `page.goto()` calls.

**If workspace URL not found in glossary:**
1. Add comment: `// TODO: Find direct URL, using menu navigation fallback`
2. Use menu navigation as temporary pattern
3. When workspace is discovered, update `docs/D365_URL_GLOSSARY.md` and refactor test

### File Organization

| Directory | Purpose |
|-----------|---------|
| `tests/` | Test specifications (all files: `*.spec.ts`) |
| `helpers/` | Reusable extraction functions (`d365-form-utils.ts`) |
| `playwright/` | Configuration and `.auth/` cached state |
| `test-results/` | Generated HTML reports |

### Test Naming Conventions

- **ADO-converted tests**: `id-<ADO_ID>-<description>.spec.ts` (e.g., `id-41504-mss-navigation.spec.ts`)
- **Feature tests**: `<feature>-test.spec.ts` (e.g., `checkESS-test.spec.ts`)
- **Debug tests**: `*-debug.spec.ts` (not run in CI, used for DOM inspection)
- Example files:
  - `id-41504-mss-navigation.spec.ts` (Navigate to MSS workspace)
  - `id-41505-people-navigation.spec.ts` (Navigate to People workspace)
  - `checkESS-test.spec.ts` (ESS data extraction example)
  - `inspectESS-debug.spec.ts` (Debug inspection with pauses)

### Configuration Timeouts

- **Test timeout**: 60 seconds (in `playwright.config.ts`)
- **Assertion timeout**: 10 seconds
- **Navigation timeout**: 45 seconds (for `waitFor()` calls)
- **Individual wait timeout**: 120,000ms set per-test when needed

**Pattern**: Tests handling D365 workspaces often need explicit `test.setTimeout(120000)` to avoid premature timeout.

## Critical Developer Workflows

### Running Tests

```powershell
# Install dependencies
npm install

# Run all tests (outputs HTML report)
npx playwright test

# Run specific test file
npx playwright test checkESS-test.spec.ts

# Run in debug mode (headed browser with inspector)
npx playwright test --debug
```

### Debugging Data Extraction Issues

1. **Use debug test**: Run `inspectESS-debug.spec.ts` to pause and inspect DOM
2. **Add console.log**: Test files already use `console.log()` for navigation steps
3. **HTML reports**: Check `test-results/` or `playwright-report/index.html`
4. **Check form structure**: Look for how labels relate to input elements

### Adding New Tests

1. Create file in `tests/` directory (use `.spec.ts` extension)
2. Import `{ test, expect }` from `@playwright/test`
3. Set timeout with `test.setTimeout(120000)` if testing D365 workspaces
4. **For workspace navigation**: Use `navigateToWorkspace(page, '<workspace_id>')` helper (applies three-layer waits automatically)
   - Workspace IDs: Check `docs/D365_URL_GLOSSARY.md` for complete list
   - If URL not in glossary: add comment `// TODO: Find direct URL`, use menu navigation as fallback
5. **For data extraction**: Use `extractFieldValue()` or `extractAllFormFields()` from helpers
6. **Verification pattern**: Check for expected content in `[role="main"]` after navigation/clicks
7. **Keep tests under 30 lines maximum** - concise, readable, maintainable
8. Add tags at end of test title: `@hr @<functional_area> @<risk_level> @<context>`
   - Risk levels: `@critical` / `@important` / `@low`
   - Context: `@ci` / `@regression` / `@smoke`
   - Functional areas: `@navigation` / `@payroll` / `@leave` / etc.
9. Use console.log for debug steps without cluttering assertions

**ADO Conversion Pattern** (see `id-41504-mss-navigation.spec.ts` for example):
```typescript
import { test, expect } from '@playwright/test';
import { navigateToWorkspace } from '../helpers/d365-form-utils';

// Pattern: Title + tags for categorization
test('ADO #41506: Navigate to Workforce and view Address Changes @hr @navigation @important @ci', async ({ page }) => {
  test.setTimeout(120000);

  // 1. Navigate to workspace (glossary: HcmWorkforceWorkspace)
  await navigateToWorkspace(page, 'HcmWorkforceWorkspace');

  // 2. Perform action (click tile, fill form, etc.)
  await page.locator('text=Address changes').first().click();
  await page.waitForLoadState('networkidle');
  await page.locator('[role="main"]').first().waitFor({ timeout: 15000 });

  // 3. Verify by text content (not fragile selectors)
  const main = page.locator('[role="main"]').first();
  await expect(main).toContainText('Worker', { timeout: 5000 });

  // 4. Screenshot for report
  await page.screenshot({ path: 'test-results/id-41506-address-changes.png' });
});
```

### Modifying Extraction Logic

All extraction happens in `helpers/d365-form-utils.ts`:
- `navigateToWorkspace(page, workspaceId)` - Navigate with three-layer wait strategy automatically applied
- `extractFieldValue(page, labelText)` - Extract single field by label (tries 3 strategies: aria-labelledby, text content, input search)
- `extractAllFormFields(page)` - Extract all visible fields as key-value pairs

When adding new extraction: Implement all 3 strategies in the helper for consistency. Always prefer using these helpers rather than writing inline extraction logic in tests.

## Integration Points & Dependencies

### External Dependencies

- `@playwright/test` (v1.56.1) - Browser automation
- `dotenv` - Environment variable loading
- TypeScript - All source files are `.ts`

### Cross-Component Communication

- Tests import helpers: `import { extractFieldValue } from '../helpers/d365-form-utils'`
- Helpers only depend on Playwright `Page` object (no D365-specific SDK)
- All state managed by Playwright's storage (cached auth)

### Data Flow

```
global-setup.ts (auth) → .env (creds) → playwright.config.ts (setup)
                ↓
         test files access cached auth
                ↓
     navigate to D365 workspace URLs
                ↓
      extract data using helper functions
                ↓
     assert extracted values are correct
```

## Common Gotchas & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Fields not found" | Missed wait layers | Ensure all 3 wait layers present in navigation |
| Extracts wrong values | Only checking inputs | Use helpers (they try all 3 strategies: aria-labelledby, text extraction, input search) |
| "element not stable" | Navigation before load complete | Add `waitForLoadState('networkidle')` after clicks and navigation |
| Auth state expires | Cached auth older than session | Delete `playwright/.auth/user.json` and rerun; global-setup will re-authenticate |
| Form values empty | Reading display field as input | Read `textContent` from parent instead; helpers handle this automatically |
| Workspace "not found" | Using wrong workspace ID | Check `docs/D365_URL_GLOSSARY.md` for correct `mi=<WorkspaceId>` parameter |
| Test timeout | Navigation taking > 60s | Use `test.setTimeout(120000)` for D365 workspace tests; 60s default often insufficient |

## Best Practices for D365-Specific Development

### Selector Reliability & DOM Navigation

D365 forms use labels as stable anchors. Prefer:
1. **Label-based extraction**: Find label by text, walk parent to find associated input/value
2. **Text locators**: `page.locator('text=<exact_text>')` works well for buttons and tiles
3. **ARIA attributes**: `aria-labelledby`, `aria-describedby` for association

**Avoid** (unreliable across instances):
- `data-control-name` attributes (instance-specific, unstable naming)
- Absolute XPath positions (fragile across form variations)
- Deep class selectors (D365 regenerates class names on updates)

### Simple Test Design Philosophy

Recent ADO conversions (ID-41504, ID-41505, ID-41506) show that **simpler tests are more reliable**:
- Use direct URLs via `navigateToWorkspace()` when possible (avoids menu navigation complexity)
- Single locator strategy often sufficient: `page.locator('text=...')` for common elements
- Verification by text content in `[role="main"]` is robust and D365-agnostic
- Avoid complex fallback logic; let tests fail fast with clear error messages

### Test Architecture Pattern

All workspace tests follow this reliable sequence:
1. Navigate to workspace with `navigateToWorkspace(page, '<WorkspaceId>')` (includes 3-layer wait)
2. Perform action (click, fill form, etc.)
3. Wait for load: `await page.waitForLoadState('networkidle')`
4. Wait for visibility: `await page.locator('[role="main"]').waitFor({ timeout: 15000 })`
5. Assert by text content: `expect(page.locator('[role="main"]')).toContainText('expected')`
6. Screenshot for report: `await page.screenshot({ path: 'test-results/...' })`

## Key Files to Reference

- **Test example**: `tests/checkESS-test.spec.ts` (complete working example)
- **Helper functions**: `helpers/d365-form-utils.ts` (all extraction logic)
- **Configuration**: `playwright.config.ts` (timeouts, auth, baseURL)
- **Setup**: `global-setup.ts` (authentication flow)
- **Comprehensive guide**: `D365_DATA_EXTRACTION_FRAMEWORK.md` (detailed architecture)
