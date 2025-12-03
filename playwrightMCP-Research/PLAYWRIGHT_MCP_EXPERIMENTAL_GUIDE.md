# Optional: Experimenting with Playwright MCP

This guide is for those curious about integrating Playwright MCP as a **supplementary tool** for test discovery and template generation. **This is optional and NOT required for your production test suite.**

---

## When to Use Playwright MCP

| Scenario | Use It? | Why |
|----------|---------|-----|
| Writing regression tests | ❌ No | Your framework is more reliable |
| Converting ADO tests to code | ⚠️ Maybe | Good for generating templates, must refine |
| UAT test creation | ✅ Yes | Great for business users |
| Quick D365 exploration | ✅ Yes | Fast prototyping |
| Learning D365 UI patterns | ✅ Yes | Discover new workflows |
| Production CI/CD tests | ❌ No | Adds cost and complexity |

---

## Setup (if you want to try)

### Prerequisites

1. **GitHub Copilot in VS Code** (requires paid subscription or free trial)
   - Install: `GitHub Copilot` extension from VS Code marketplace
   - Enable: Sign in with GitHub account

2. **Playwright MCP Server**
   ```powershell
   # Install Playwright MCP
   npm install @anthropic-sdks/playwright-mcp --save-dev
   
   # Or follow official docs: https://github.com/microsoft/playwright-mcp
   ```

3. **LLM Access** (choose one)
   - GitHub Copilot (built into VS Code, pay per month)
   - OpenAI API (GPT-4, pay per request)
   - Claude API (Anthropic, pay per request)
   - Codeium (free tier available)

### Verify Playwright MCP Installation

```powershell
# Check if installed
npm list @anthropic-sdks/playwright-mcp

# If installed, you should see version info
# If not installed, run: npm install @anthropic-sdks/playwright-mcp --save-dev
```

---

## Workflow: Using Playwright MCP for Test Discovery

### Scenario: Convert Your ADO Test #41908 to a Template

**Goal**: Get a quick template, then refine it manually.

### Step 1: Open Copilot Chat in VS Code

```
Ctrl+Shift+I (or Cmd+Shift+I on Mac) → Copilot Chat window opens
```

### Step 2: Provide Test Context

```
Paste this into Copilot Chat:

"I have an ADO test case that needs to be automated with Playwright.

Test: Validate an employee for 'Ready to Pay'

Steps:
1. Navigate to the Workers list in Dynamics 365 Finance & Operations
2. Search for and select a worker (e.g., 'Richard Anthony Raine')
3. Click the Payroll tab
4. Click the 'Validate' button
5. Verify a confirmation message appears

The application loads dynamically, so please set page timeout to 18000ms 
for all interactions.

Assume I'm already logged in to D365.

Please use Playwright MCP to help me execute this test and generate the code."
```

### Step 3: Copilot Interprets Your Prompt

Copilot (with Playwright MCP) will:
- Recognize the need for browser automation
- Trigger Playwright MCP actions
- Execute steps in a real browser
- Generate TypeScript code

**What happens next** (from blog post):
- Browser launches automatically
- Copilot navigates to your D365 instance
- It clicks through the workflow
- Generates test code

### Step 4: Review Generated Code

Copilot outputs something like:
```typescript
test('Validate employee for ready to pay', async ({ page }) => {
  await page.goto('https://instance.axcloud.dynamics.com');
  await page.click('text=Workers');
  // ... more steps
});
```

### Step 5: Refine Manually (IMPORTANT)

Take the output and apply your proven patterns:

```typescript
// Before (AI-generated - basic)
test('Validate employee for ready to pay', async ({ page }) => {
  await page.goto(baseURL);
  await page.click('text=Workers');
  await page.fill('[aria-label="Search"]', 'Richard');
  await page.click('text=Richard Anthony Raine');
  await page.click('text=Payroll');
  await page.click('button:has-text("Validate")');
  expect(page).toContainText('confirmation');
});

// After (your refined version - production-grade)
test('ADO #41908: Validate employee for ready to pay', async ({ page }) => {
  test.setTimeout(120000);

  console.log('Steps 1-2: Navigate to Workers and select employee');
  await page.goto('/?cmp=4415&mi=HcmWorkerListPage', { waitUntil: 'networkidle' });
  
  // Your three-layer wait strategy
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.locator('[role="main"]').first().waitFor({ timeout: 45000 });
  await page.waitForTimeout(2000);

  // Search for worker
  await page.locator('input[aria-label*="Search"]').fill('Richard');
  await page.locator('text=Richard Anthony Raine').click();
  await page.waitForLoadState('networkidle');

  console.log('Step 3: Click Payroll tab and Validate');
  await page.locator('text=Payroll').click();
  await page.locator('button:has-text("Validate")').click();

  console.log('Step 4: Verify confirmation');
  const confirmationLocator = page.locator('text=/validation|confirmed|ready/i');
  await confirmationLocator.waitFor({ timeout: 10000 });
  await expect(confirmationLocator).toBeVisible();
  console.log('✓ Validation confirmation displayed');
});
```

---

## Known Limitations (from Blog Post)

### 1. AI May Struggle with D365-Specific Elements

**Problem**: D365 has complex DOM, shadow DOM, and dynamic loading
**AI Limitation**: GenAI doesn't understand your three-layer wait strategy
**Your Fix**: Add explicit waits after any AI-generated code

### 2. AI May Not Find Correct Selectors

**Problem**: AI might click wrong button if multiple similar elements exist
**AI Limitation**: Without context, AI picks the first match
**Your Fix**: Specify unique selectors (by label text, ARIA attributes, role)

### 3. Authentication Can Be Unpredictable

**Blog recommends**: Manual login first, then skip auth in tests
**Why**: AI can't handle MFA reliably
**Your approach**: Already handles this with `global-setup.ts`

### 4. AI-Generated Code Needs Review

**Problem**: AI may not follow your coding standards
**Blog recommendation**: "Review generated scripts before deployment"
**Your approach**: Manual review + your helper functions

---

## Best Practices (from Blog Post + Your Framework)

### 1. Write Clear, Structured Test Scripts
```
✅ GOOD (specific, atomic steps)
"1. Navigate to Workers
 2. Click Search field
 3. Enter 'PN000357'
 4. Click the first result"

❌ BAD (vague, compound steps)
"Find and open a worker record"
```

### 2. Provide Specific Prompts
```
✅ GOOD
"Click the 'Validate' button in the Payroll tab at the top of the page"

❌ BAD
"Validate the employee"
```

### 3. Set Appropriate Timeouts
```typescript
// Include timeout in prompt:
"Set page action timeout to 18000ms to account for D365 loading time"

// Or in code after AI generation:
test.setTimeout(120000);
```

### 4. Treat as Interactive Tool

AI may pause and ask for user confirmation. This is **good** - it means:
- AI is uncertain about next step
- You can confirm or correct direction
- Keeps you in control

### 5. Always Refine Generated Code

Apply your patterns:
- Add three-layer wait strategy
- Use your helper functions
- Add meaningful console.log
- Include ADO test ID in test name
- Test locally first

---

## Prompts to Try

### Template 1: Basic Test Generation

```
"Please create a Playwright test for this ADO test case:
[Paste ADO test steps here]

Requirements:
- Use Playwright @1.56.1
- Set timeout to 120000ms
- Wait for [role='main'] to be visible
- Include console.log for each step
- Use text-based selectors (prefer label text over data attributes)
- Include meaningful assertions"
```

### Template 2: Selector Discovery

```
"I need to find selectors for D365 elements. Please:
1. Navigate to [D365 URL]
2. Locate the 'Validate' button on the Payroll section
3. Find the 'Search' field in the Workers list
4. Tell me the most reliable selector for each

Use text content or ARIA attributes where possible."
```

### Template 3: Multi-Test Generation

```
"I have 5 ADO test cases for D365 HR Payroll (attached CSV).
Please generate Playwright test templates for each, with:
- Test name including ADO test ID
- Proper timeout handling
- Wait strategies for D365 loading
- Placeholder TODO comments for selectors needing investigation"
```

---

## Potential Drawbacks & Mitigation

| Issue | Mitigation |
|-------|-----------|
| AI hallucinates selectors | Always verify with actual page inspection before running |
| No understanding of D365 patterns | Add explicit context in prompts about D365 dynamics |
| Generated code may not follow your patterns | Review and refactor all AI-generated code before committing |
| LLM API costs | Only use for one-time template generation, not every test run |
| AI can't handle MFA | Use manual login + session caching (already in your setup) |
| Unpredictable behavior | Use Playwright MCP for discovery, not production tests |

---

## When NOT to Use Playwright MCP

```
❌ DO NOT use for:
- Production regression tests (use your framework)
- CI/CD pipeline automation (add cost and latency)
- Critical business logic testing (needs reliability)
- Tests with complex assertions (AI doesn't understand context)
- Tests that must run 24/7 (API dependency is fragile)
```

---

## Summary: Experimental Workflow

If you decide to experiment:

```
1. Write ADO test plan (natural language)
   ↓
2. Use Copilot + Playwright MCP to generate template
   ↓
3. Get AI-generated .ts file
   ↓
4. Manually refine with your patterns:
   - Add three-layer waits
   - Use your helpers
   - Update selectors if needed
   ↓
5. Test locally with: npx playwright test
   ↓
6. Commit final, refined version to repo
```

**Time saved**: 2-3 hours on initial template generation  
**Time added back**: 30 minutes for manual refinement  
**Net benefit**: Fast test creation + high reliability  
**Cost**: ~$5-15/month for Copilot, or pay-per-token if using OpenAI

---

## Recommendation

**Start with**: Your manual framework (proven, stable)  
**Experiment with**: Playwright MCP for quick UAT test generation  
**Production**: Stick with hand-written, refined tests  
**Result**: Best of both worlds - speed + reliability

The blog post shows Playwright MCP is great for **discovery and initial creation**, but your framework is better for **production automation and reliability**.
