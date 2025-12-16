# D365 F&O Playwright Testing Framework — URL Glossary

## Overview

This glossary maps common D365 F&O testing scenarios to direct URL links. Use these URLs to bypass menu navigation and jump directly to the page under test.

**Base Format**: `/?cmp=LEGAL_ENTITY_ID&mi=PAGE_MENU_ITEM`

- `cmp`: Legal entity ID (e.g., 4415, 1001, USMF)
- `mi`: Menu item identifier (page name)

---

## HR & Payroll Workspaces

| Module | Page | URL |
|--------|------|-----|
| HR | Worker List | `/?cmp=4415&mi=HcmWorkerListPage` |
| HR | Position List (All Positions) | `/?cmp=4415&mi=HcmPositionList` |
| HR | Employee Self Service (ESS) | `/?cmp=4415&mi=HcmEmployeeSelfServiceWorkspace` |
| HR | Manager Self Service (MSS) | `/?cmp=4415&mi=HcmManagerSelfServiceWorkspace` |
| HR | People (People Hub / Workers Hub) | `/?cmp=4415&mi=HcmPeopleHub` |
| HR | Personnel Management / Workforce | `/?cmp=4415&mi=HcmWorkforceWorkspace` |
| Payroll | Compensation Management | `/?cmp=4415&mi=HcmCompensationWorkspace` |
| Payroll | Ready to Pay Validation | `/?cmp=4415&mi=ReadyToPayWorkspace` |
| HR | Leave Management | `/?cmp=4415&mi=LeaveManagementWorkspace` |
| HR | Recruitment | `/?cmp=4415&mi=RecruitmentWorkspace` |
| HR | Organization Chart | `/?cmp=4415&mi=OrgChart` |

---

## Finance & Operations Workspaces

| Module | Page | URL |
|--------|------|-----|
| Accounts Receivable | All Sales Orders | `/?cmp=4415&mi=SalesOrderListPage` |
| Accounts Payable | All Purchase Orders | `/?cmp=4415&mi=PurchaseOrderListPage` |
| Inventory | All Inventory Transactions | `/?cmp=4415&mi=InventoryTransactionListPage` |
| General Ledger | Chart of Accounts | `/?cmp=4415&mi=MainAccountListPage` |

---

## Form Pages (Direct Navigation)

| Module | Form | URL Pattern |
|--------|------|-------------|
| HR | Worker Form (specific worker) | `/?cmp=4415&mi=HcmWorkerListPage&record={WORKER_ID}` |
| Payroll | Employee Ready to Pay | `/?cmp=4415&mi=EmployeeReadyToPayListPage` |
| HR | Leave Requests | `/?cmp=4415&mi=LeaveRequestList` |
| HR | Training Records | `/?cmp=4415&mi=HcmTrainingRecordList` |

---

## How to Use in Test Plans

### Example 1: Convert ADO Test to Playwright

**ADO Test Plan:**
```
Step 1: Navigate to Workers from Human Resources menu
Step 2: Search for employee "John Doe"
Step 3: Verify employee details display correctly
```

**Playwright Test (using glossary):**
```typescript
test('ADO #12345: View employee details', async ({ page }) => {
  // Instead of clicking menus, go directly to Workers page
  await page.goto('/?cmp=4415&mi=HcmWorkerListPage', { waitUntil: 'networkidle' });
  
  // Search for employee
  await page.locator('input[aria-label*="Search"]').fill('John Doe');
  
  // Verify details
  await expect(page.locator('text=John Doe')).toBeVisible();
});
```

### Example 2: Test Compensation Management Workflow

```typescript
test('ADO #54321: Submit payroll for processing', async ({ page }) => {
  // Navigate directly to Compensation Management
  await page.goto('/?cmp=4415&mi=CompensationManagementWorkspace', { waitUntil: 'networkidle' });
  
  // Perform test actions...
});
```

---

## Finding Missing URLs

If you need a URL for a page not listed here:

1. **Navigate manually** in D365 (using the UI menu)
2. **Copy the URL** from the browser address bar
3. **Extract the `mi=` parameter** (the page name)
4. **Add to this glossary** for reuse by other tests

**Example:**
- Navigate to: Human Resources → Workers → All Workers
- URL in browser: `https://instance.axcloud.dynamics.com/?cmp=4415&mi=HcmWorkerListPage`
- Add to glossary: `HcmWorkerListPage`

---

## Legal Entity Mapping

Common legal entity IDs:

| Legal Entity | ID | Notes |
|-------------|-----|-------|
| Default (usually UK) | `4415` | Adjust based on your setup |
| USMF (Demo company) | `USMF` | Common test instance |
| CEU (Europe demo) | `CEU` | Pan-European entity |

**Replace `4415` with your legal entity ID** as needed.

---

## Advanced Patterns

### Multi-Company Testing

```typescript
// Test different legal entities
const companies = ['4415', '1205', '4215'];

for (const cmp of companies) {
  await page.goto(`/?cmp=${cmp}&mi=HcmWorkerListPage`, { waitUntil: 'networkidle' });
  // Verify functionality works across all entities
}
```

### Environment-Specific URLs

```typescript
// Parametrize environment and legal entity
const baseUrl = process.env.D365_URL; // e.g., https://instance.axcloud.dynamics.com
const legalEntity = process.env.LEGAL_ENTITY || '4415';
const page = `HcmWorkerListPage`;

await page.goto(`${baseUrl}/?cmp=${legalEntity}&mi=${page}`, { waitUntil: 'networkidle' });
```

---

## Tips for Test Maintenance

1. **Keep URLs Centralized**: Store in a constants file rather than hardcoding
   ```typescript
   // src/constants/d365-urls.ts
   export const D365_URLs = {
     WORKERS: '/?cmp=4415&mi=HcmWorkerListPage',
     ESS: '/?cmp=4415&mi=HcmEmployeeSelfServiceWorkspace',
     // ...
   };
   
   // In tests:
   await page.goto(D365_URLs.WORKERS);
   ```

2. **Update Glossary Regularly**: When new workflows are tested, add to this doc

3. **Version Control**: Commit URL changes alongside test changes

4. **Document Changes**: If a page name changes in D365, update the glossary and all tests

---

## Troubleshooting

**Issue**: Page not found (404 or blank)
- **Cause**: Wrong legal entity or `mi` parameter
- **Fix**: Verify `cmp` and `mi` values are correct

**Issue**: "Access Denied" or page redirects
- **Cause**: User doesn't have permission to that page
- **Fix**: Check security roles and menu visibility in D365

**Issue**: Page loads but content missing
- **Cause**: D365 is still loading content (async JS)
- **Fix**: Add waits: `await page.locator('[role="main"]').waitFor()`

---

## Related Resources

- `playwright.config.ts` — Base URL configuration
- `helpers/d365-form-utils.ts` — Helper functions for extraction
- `tests/selector-investigation-debug.spec.ts` — Debug test to find new pages
- `.github/copilot-instructions.md` — AI agent guidance

---

**Last Updated**: November 17, 2025  
**Maintainers**: QA / Engineering Team  
**License**: Internal Use
