# ADO Test Conversion Work List — HR Functional Shakedown Testing (ID-58642)

**Generated**: December 16, 2025  
**Last Updated**: December 16, 2025 (Session Complete)  
**Total Test Cases**: 58  
**Currently Converted**: 23 ✅ (5 created but data-dependent ⏸️)  
**Remaining**: 30

---

## Conversion Status Summary

### ✅ Completed (23 tests - ALL PASSING)

**Existing Tests (8)**:
- ID-41504: Navigate to MSS (My team) — **DONE**
- ID-41505: Navigate to People workspace — **DONE**
- ID-41506: Navigate to Address Changes — **DONE**
- ID-41908: Validate employee for ready to pay — **DONE**
- ID-41909: View ready to pay results — **DONE**
- ID-41914: Add ready to pay override — **DONE**
- ID-41915: View workers in buckets (ready/not ready/overridden) — **DONE**
- ID-41916: Manually send file to iipay — **DONE**

**Batch 1 - Simple Navigation (6)**:
- ID-41503: Navigate to ESS — **DONE** ✅
- ID-41513: Navigate to Workers — **DONE** ✅
- ID-41515: Navigate to Positions — **DONE** ✅
- ID-41518: Navigate to Compensation Management — **DONE** ✅
- ID-41519: Navigate to own performance review — **DONE** ✅
- ID-41520: Navigate to own performance goals — **DONE** ✅

**Batch 2 - MSS Navigation (5)**:
- ID-41521: My Teams performance goals — **DONE** ✅
- ID-41522: My Teams performance reviews — **DONE** ✅
- ID-41959: MSS Team performance review — **DONE** ✅
- ID-41960: MSS Team performance goals — **DONE** ✅
- ID-41961: MSS Exiting workers — **DONE** ✅

**Batch 3 - ESS View/Read (4)**:
- ID-41952: View Compensation — **DONE** ✅
- ID-44347: ESS Banking warning — **DONE** ✅
- ID-41962: Open positions (Direct & Extended) — **DONE** ✅
- ID-41963: My worker/position actions — **DONE** ✅

### ⏸️ Created But Data-Dependent (5 tests)

**Batch 4 - Performance Management CRUD (requires test data)**:
- ID-41953: Add performance goals — **CREATED** (requires goal templates)
- ID-41954: Edit goals — **CREATED** (requires existing goals)
- ID-41955: Add comments on review — **CREATED** (requires active reviews)
- ID-41956: Submit review to manager — **CREATED** (requires in-progress reviews)
- ID-41965: Manager adds comments — **CREATED** (requires direct report reviews)

**Blocker**: Need test data setup:
- Performance reviews in "In Progress" status
- Performance goals assigned to test users
- Reviews with goals for comment/submit workflows

---

## Priority 1: Easy Wins (Navigation & View-Only) — 15 Tests

These tests follow established patterns from ID-41504/41505/41506. Simple navigation + text verification. **Estimated: 1-2 hours each**.

| ADO ID | Title | Steps | Complexity | Notes |
|--------|-------|-------|------------|-------|
| **41503** | Navigate to ESS from default dashboard | 1 | ⭐ EASY | Direct URL via `navigateToWorkspace('HcmEmployeeSelfServiceWorkspace')` |
| **41512** | Navigate to worker/position actions (inc history) | 8 | ⭐⭐ MEDIUM | Menu navigation + workflow view — reuse menu helpers |
| **41513** | Navigate to Workers | 5 | ⭐ EASY | Menu nav → verify Workers form opens |
| **41515** | Navigate to Positions | 5 | ⭐ EASY | Menu nav → verify Positions form opens |
| **41518** | Navigate to Compensation Management | 3 | ⭐ EASY | Workspace nav (check URL glossary for `HcmCompensationManagementWorkspace`) |
| **41519** | Navigate to own performance review | 2 | ⭐ EASY | ESS tile → "View reviews" → verify form opens |
| **41520** | Navigate to own performance goals | 2 | ⭐ EASY | ESS → "View all goals" → verify form opens |
| **41521** | Navigate to My Team's performance goals | 3 | ⭐ EASY | ESS → My team → tile → verify |
| **41522** | Navigate to My Team's performance reviews | 3 | ⭐ EASY | ESS → My team → tile → verify |
| **41524** | Navigate to Workers compensation | 8 | ⭐⭐ MEDIUM | Menu nav + tab click — data extraction optional |
| **41959** | Access team's performance review | 2 | ⭐ EASY | MSS → tile → verify form |
| **41960** | Access team performance goals | 2 | ⭐ EASY | MSS → tile → verify form |
| **41961** | Access Exiting workers | 2 | ⭐ EASY | MSS → tile → verify form |
| **41962** | Access Open positions (Direct & Extended) | 4 | ⭐ EASY | MSS → two tiles → verify forms |
| **41963** | Access My worker/position actions | 4 | ⭐ EASY | MSS → related links → verify forms |

**Quick Start Recommendation**: Convert **41503, 41513, 41515, 41518, 41519, 41520** first (6 tests, ~6-8 hours total). These are all single-workspace or ESS-tile navigations with text verification only.

---

## Priority 2: ESS Personal Data (Read/Edit) — 9 Tests

ESS forms with basic CRUD operations. Use `extractFieldValue()` and `extractAllFormFields()` helpers. **Estimated: 2-3 hours each**.

| ADO ID | Title | Steps | Complexity | Notes |
|--------|-------|-------|------------|-------|
| **41920** | Add private home address | 6 | ⭐⭐ MEDIUM | ESS → Edit personal details → Addresses tab → Add → fill form → verify |
| **41946** | Edit home address | 3 | ⭐⭐ MEDIUM | ESS → Edit → update → verify |
| **41947** | Add/remove contact email/phone, set private | 6 | ⭐⭐ MEDIUM | Contact details tab → Add/Remove → verify |
| **41949** | Add personal contacts, emergency contact | 8 | ⭐⭐⭐ HARD | Multi-step: add contact → toggle emergency → add address → add contact details |
| **41952** | View Compensation | 2 | ⭐ EASY | ESS → Show padlock → click value → verify history |
| **44347** | ESS Banking: initial warning | 4 | ⭐ EASY | ESS → My payment method → verify warning text |
| **44348** | ESS Adding bank disbursement | 2 | ⭐⭐ MEDIUM | My payment methods → +New → fill form → save |
| **44349** | ESS Editing bank disbursements | 2 | ⭐⭐ MEDIUM | Select row → Edit → update → verify |
| **49899** | Bank disbursement warnings | 6 | ⭐⭐⭐ HARD | Multi-scenario: test all warning states (no primary, no remainder, etc.) |

**Quick Start Recommendation**: Convert **41952, 44347** first (2 tests, ~3 hours total). These are read-only verification tests with no form mutations.

---

## Priority 3: Performance Goals & Reviews (ESS) — 6 Tests

Performance management workflows. Mix of view/edit/submit. **Estimated: 2-4 hours each**.

| ADO ID | Title | Steps | Complexity | Notes |
|--------|-------|-------|------------|-------|
| **41953** | Add performance goals | 5 | ⭐⭐ MEDIUM | ESS → View all goals → Add from template → fill dates → verify |
| **41954** | Edit goals | 4 | ⭐⭐ MEDIUM | ESS → View goals → Edit → update → save |
| **41955** | Add comments on performance review | 5 | ⭐⭐ MEDIUM | ESS → View reviews → Add comment → post → verify |
| **41956** | Submit review to manager | 3 | ⭐⭐ MEDIUM | ESS → View reviews → Submit → verify status update |
| **41964** | Adding goals to a review | 5 | ⭐⭐⭐ MEDIUM | MSS → Team reviews → Add goal to review → select goals → verify |
| **41965** | Add comments on direct report's review | 5 | ⭐⭐ MEDIUM | MSS → Team reviews → Add comment → post → verify |

**Quick Start Recommendation**: Start with **41954, 41955** (2 tests, ~4-5 hours). These are simpler edit/comment workflows.

---

## Priority 4: Manager Workflows (MSS) — 2 Tests

Manager-specific review workflows. Requires manager-level access. **Estimated: 3-5 hours each**.

| ADO ID | Title | Steps | Complexity | Notes |
|--------|-------|-------|------------|-------|
| **41966** | Add ratings, date finished, signoff review | 7 | ⭐⭐⭐ HARD | MSS → Team reviews → Add ratings → Date finished → Signoff → verify workflow completion |
| **58833** | Reward team - Letter generation settings | 9 | ⭐⭐⭐ HARD | Compensation mgmt → Rewards letter mgmt → Setup tab → toggle access flags → edit SharePoint |

**Recommendation**: Defer these until Priority 1-3 tests are complete. Requires manager/rewards-team role and external SharePoint validation.

---

## Priority 5: Worker CRUD Operations — 14 Tests

Creating, updating, transferring, and terminating workers/positions. **High complexity** due to workflows, compensation updates, and multi-step forms. **Estimated: 4-8 hours each**.

| ADO ID | Title | Steps | Complexity | Notes |
|--------|-------|-------|------------|-------|
| **41462** | New position tasks | 8 | ⭐⭐⭐⭐ VERY HARD | HR → All positions → New → Fill general/position/payroll/FD sections → Complete |
| **41465** | Cloned positions | 8 | ⭐⭐⭐ HARD | HR → All positions → New → Copy values from position → Update → Complete |
| **41466** | New worker | 6 | ⭐⭐⭐⭐ VERY HARD | HR → Workers → New → Fill action/comp → Complete |
| **41719** | Terminations | 6 | ⭐⭐⭐ HARD | HR → Workers → Terminate → Fill dialogue → Complete → verify status |
| **41724** | Position transfer | 5 | ⭐⭐⭐ HARD | HR → Workers → Change position → Fill dialogue with comp → Complete |
| **42042** | Reactivate position | 6 | ⭐⭐⭐ MEDIUM | HR → Inactive positions → Edit → Update dates → Complete |
| **42043** | Retire position (backdated/future) | 4 | ⭐⭐⭐ MEDIUM | HR → Active positions → Edit → Set retirement date → verify inactive list |
| **42044** | Amend details on position | 4 | ⭐⭐⭐ MEDIUM | HR → Active positions → Edit → Update job/FTE/FD → Complete |
| **42048** | Edit worker name details | 3 | ⭐⭐ MEDIUM | Workers → Change worker name → Enter new name → verify |
| **42049** | Update workers personal information | 2 | ⭐⭐ MEDIUM | Workers → Edit personal info (marital status, gender, etc.) → verify |
| **42051** | Update worker employment dates/terms | 5 | ⭐⭐⭐ MEDIUM | Workers → Work tab → Employment history → Edit dates → Update terms |
| **42052** | Update/new compensation action | 5 | ⭐⭐⭐ HARD | Workers → Compensation → Fixed plan → Change comp / New action → verify |
| **42066** | Worker transfer via workflow | 6 | ⭐⭐⭐⭐ VERY HARD | Workers → Change position → Fill transfer dialogue with comp → Complete → verify |
| **44178** | Reset FY25 review (delete & recreate) | 5 | ⭐⭐ MEDIUM | Workers → Person → Review → Delete old → New from template → verify |

**Recommendation**: Defer to **Phase 2** after 30+ easier tests are complete. These require deep D365 form expertise, data setup (workers/positions), and complex workflows.

---

## Priority 6: Advanced CRUD & Workflows — 11 Tests

Complex multi-step operations: identification, custom fields, compensation, contacts, reviews. **Estimated: 3-6 hours each**.

| ADO ID | Title | Steps | Complexity | Notes |
|--------|-------|-------|------------|-------|
| **42053** | Create/edit Identification record | 3 | ⭐⭐ MEDIUM | Workers → Person → Identification → Edit/Add → verify |
| **42055** | Update worker custom fields | 2 | ⭐⭐ MEDIUM | Workers → Update custom fields (work location type, payroll ID, etc.) → verify |
| **42056** | Adding review to worker | 4 | ⭐⭐ MEDIUM | Workers → Person → Reviews → New from template → verify |
| **42057** | Update worker address | 3 | ⭐⭐ MEDIUM | Workers → Addresses → Edit → verify |
| **42059** | Adding associated worksite | 4 | ⭐⭐⭐ MEDIUM | Workers → Addresses → More options → Select other → Assign to office location |
| **42061** | Adding/editing worker contact information | 5 | ⭐⭐ MEDIUM | Workers → Contact information → Add/Edit → verify |
| **42062** | Editing variable compensation enrollment | 3 | ⭐⭐⭐ MEDIUM | Workers → Compensation → Variable enrollment → Edit → verify |
| **49903** | Bank disbursement defaults/logic | 13 | ⭐⭐⭐⭐ VERY HARD | Multi-scenario: test all toggle/validation logic for primary/remainder accounts |
| **58834** | Rewards team - Letter generation table updates | 3 | ⭐⭐ MEDIUM | Comp mgmt → Reward letters → Edit table → verify |
| **58835** | Rewards team - Generate letters | 5 | ⭐⭐⭐ MEDIUM | Reward mgmt → Select record → Download (Word/PDF) → verify download |
| **58837** | HRBP - Rewards letter access | 7 | ⭐⭐⭐ HARD | Test role-based access: HRBP Reward role → toggle BP access → verify visibility → download |
| **58838** | Manager - Rewards letter access | 9 | ⭐⭐⭐ HARD | Test role-based access: Manager Reward role → toggle access → verify visibility → download |

**Recommendation**: Defer to **Phase 3** after Priority 1-3 complete (~40 tests). Many require specific role assignments and external validations (SharePoint downloads).

---

## Test Navigation Plan (ID-40941)

**Note**: ID-40941 is a **meta test plan** ("Create a test plan to include these navigations"). It's not a single test case but a grouping of the following navigation tests:
- Default dashboard ✅ (smoke-test.spec.ts exists)
- ESS/MSS → **41503, 41504** ✅
- People workspace → **41505** ✅
- Address changes → **41506** ✅
- Worker actions / Position actions → **41512**
- Workers → **41513**
- Positions → **41515**
- Compensation → **41524**
- Performance reviews → **41519, 41520, 41521, 41522**
- Education → (not found in CSV — may be future scope)
- Compensation Management → **41518**

**Status**: 4/13 navigation tests complete. Recommend completing remaining 9 navigation tests as Priority 1.

---

## Recommended Conversion Order (Next 20 Tests)

### Batch 1: Simple Navigation (Week 1) — 6 tests
1. **41503** - ESS navigation
2. **41513** - Workers navigation
3. **41515** - Positions navigation
4. **41518** - Compensation Management navigation
5. **41519** - Own performance review navigation
6. **41520** - Own performance goals navigation

### Batch 2: MSS Navigation (Week 1-2) — 5 tests
7. **41521** - My Team's performance goals
8. **41522** - My Team's performance reviews
9. **41959** - Access team's performance review
10. **41960** - Access team performance goals
11. **41961** - Access Exiting workers

### Batch 3: ESS View/Read Operations (Week 2) — 4 tests
12. **41952** - View compensation
13. **44347** - Banking initial warning
14. **41962** - Open positions (Direct & Extended)
15. **41963** - My worker/position actions

### Batch 4: Performance Goals/Reviews Edit (Week 2-3) — 5 tests
16. **41954** - Edit goals
17. **41955** - Add comments on review
18. **41956** - Submit review to manager
19. **41953** - Add performance goals
20. **41965** - Add comments on direct report's review

**Total Estimated Time**: 30-40 hours for next 20 tests (3-4 weeks at 10 hrs/week pace).

---

## Questions for You

Before I start converting, please confirm:

1. **Test Data Availability**: Do you have test workers/positions/reviews set up in your D365 environment for:
   - Active employees with ESS access?
   - Managers with direct reports (for MSS tests)?
   - Workers with performance reviews in "In Progress" status?
   - Workers with banking information (or lack thereof for warning tests)?

2. **Role Assignments**: Which D365 user accounts have:
   - Employee self-service role?
   - Manager self-service role?
   - HR admin role (for worker CRUD tests)?
   - HRBP Reward role / Manager Reward role (for Priority 4 tests)?

3. **Priority Confirmation**: Does the **Batch 1-4 order** above make sense, or would you prefer to prioritize:
   - Only navigation tests first (Batches 1-2)?
   - Mix of navigation + ESS operations (current plan)?
   - Specific functional areas (e.g., all performance review tests together)?

4. **Conversion Pace**: Should I:
   - Convert 1-2 tests now as examples and wait for your review?
   - Batch-convert all 6 Batch 1 tests immediately?
   - Create test stubs (file + test skeleton) for all 20 and fill in sequentially?

5. **Test Tags**: For the new tests, should I add tags like:
   - `@navigation` / `@ess` / `@mss` / `@crud` / `@performance` (functional area)
   - `@smoke` / `@regression` / `@critical` (test type)
   - All tests in Batch 1-4 tagged `@priority-1` for easy filtering?

---

## Complexity Legend

- ⭐ **EASY** (1-2 hours): Simple navigation + text verification. Direct URL or single menu path. No form mutations.
- ⭐⭐ **MEDIUM** (2-3 hours): Navigation + basic form interaction (click, fill 1-2 fields, save). Uses existing helpers.
- ⭐⭐⭐ **HARD** (3-5 hours): Multi-step workflows, complex forms, data extraction, or role-based access verification.
- ⭐⭐⭐⭐ **VERY HARD** (4-8 hours): Worker/position CRUD with compensation updates, workflows, multi-tab forms, external validations.

---

## Notes

- **URL Glossary**: Check `docs/D365_URL_GLOSSARY.md` for workspace IDs before using menu navigation. Direct URLs are faster and more reliable.
- **Helpers**: Use `navigateToWorkspace()`, `extractFieldValue()`, `extractAllFormFields()` from `helpers/d365-form-utils.ts`.
- **Test Pattern**: Follow `id-41504-mss-navigation.spec.ts` template: navigate → wait → action → verify text → screenshot.
- **Timeouts**: Set `test.setTimeout(120000)` for all D365 workspace tests (default 60s often insufficient).
- **Tags**: Add `@hr @<functional_area> @<risk_level> @<context>` to test titles for filtering (see copilot-instructions.md).

---

**Next Steps**: Please review the above questions and let me know your preferences. I'm ready to start converting once you confirm the approach!
