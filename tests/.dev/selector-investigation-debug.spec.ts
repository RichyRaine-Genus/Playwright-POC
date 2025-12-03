/**
 * SELECTOR INVESTIGATION TEMPLATE
 * 
 * Use this test file to investigate D365 UI elements and find the correct selectors
 * for your ADO test conversion. Run with: npx playwright test --debug
 * 
 * This helps identify:
 * - Correct locators for buttons, fields, tabs
 * - URL patterns for direct navigation
 * - Element structure and ARIA attributes
 * - Wait strategies needed for specific pages
 */

import { test, expect } from '@playwright/test';

/**
 * Investigation: Worker List Navigation & Selectors
 * 
 * Goal: Find correct selectors for:
 * - Workers list page URL
 * - Search field locator
 * - Worker selection in list
 * - Edit button location
 */
test.only('INVESTIGATE: Worker list and navigation selectors', async ({ page }) => {
  test.setTimeout(120000);

  console.log('=== INVESTIGATION: Worker List Selectors ===');
  
  // Navigate to Workers
  console.log('\n1. Navigate to Workers page');
  await page.goto('/?cmp=4415&mi=HcmWorkerListPage', { waitUntil: 'networkidle' });
  
  // Apply wait strategy
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.locator('[role="main"]').first().waitFor({ timeout: 45000 });
  await page.waitForTimeout(2000);

  console.log('   Current URL:', page.url());

  // Investigation: Find search field
  console.log('\n2. Investigating search field...');
  const searchFields = page.locator('input[type="text"], input[aria-label*="search" i], input[placeholder*="search" i]');
  const searchCount = await searchFields.count();
  console.log(`   Found ${searchCount} potential search fields`);
  for (let i = 0; i < Math.min(searchCount, 3); i++) {
    const field = searchFields.nth(i);
    const ariaLabel = await field.getAttribute('aria-label');
    const placeholder = await field.getAttribute('placeholder');
    const dataAttr = await field.getAttribute('data-test-id');
    console.log(`   Field ${i}: aria-label="${ariaLabel}", placeholder="${placeholder}", data-test-id="${dataAttr}"`);
  }

  // Investigation: Find worker list rows
  console.log('\n3. Investigating worker list structure...');
  const rows = page.locator('[role="row"]');
  const rowCount = await rows.count();
  console.log(`   Found ${rowCount} rows in list`);
  
  if (rowCount > 0) {
    const firstRow = rows.first();
    const firstRowText = await firstRow.textContent();
    console.log(`   First row content: "${firstRowText?.substring(0, 100)}..."`);
  }

  // Investigation: Find all buttons on page
  console.log('\n4. Investigating button selectors...');
  const buttons = page.locator('button');
  const buttonCount = await buttons.count();
  console.log(`   Found ${buttonCount} buttons on page`);
  
  const commonButtons = page.locator('button:has-text(/Edit|Delete|New|Search|Filter/i)');
  const commonCount = await commonButtons.count();
  console.log(`   Common action buttons: ${commonCount}`);
  for (let i = 0; i < Math.min(commonCount, 5); i++) {
    const btn = commonButtons.nth(i);
    const text = await btn.textContent();
    const ariaLabel = await btn.getAttribute('aria-label');
    console.log(`   Button ${i}: text="${text?.trim()}", aria-label="${ariaLabel}"`);
  }

  // Investigation: Form structure
  console.log('\n5. Investigating main content structure...');
  const mainContent = page.locator('[role="main"]').first();
  const mainText = await mainContent.textContent();
  console.log(`   Main content length: ${mainText?.length} characters`);
  console.log(`   Main content preview: "${mainText?.substring(0, 150)}..."`);

  // PAUSE: Use debug mode to inspect
  console.log('\n=== PAUSING FOR MANUAL INVESTIGATION ===');
  console.log('Use the Inspector to examine elements:');
  console.log('1. Right-click on elements and "Inspect" to see DOM structure');
  console.log('2. Check aria-label, data-* attributes, and role attributes');
  console.log('3. Note the CSS selectors shown in the Inspector');
  
  await page.pause(); // This pauses Playwright for manual inspection
});

/**
 * Investigation: Payroll Tab & Validate Button
 * 
 * Goal: Find correct selectors for:
 * - Payroll tab location and selector
 * - Validate button in Payroll section
 * - Confirmation message after validation
 */
test('INVESTIGATE: Payroll tab and Validate button selectors', async ({ page }) => {
  test.setTimeout(120000);

  console.log('=== INVESTIGATION: Payroll Tab Selectors ===');
  
  await page.goto('/?cmp=4415&mi=HcmWorkerListPage', { waitUntil: 'networkidle' });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.locator('[role="main"]').first().waitFor({ timeout: 45000 });
  await page.waitForTimeout(2000);

  // TODO: Navigate to a worker record (this varies)
  // For now, just investigate the page structure

  console.log('\n1. Investigating tabs on page...');
  const tabs = page.locator('[role="tab"], button:has-text(/Payroll|Tab/i)');
  const tabCount = await tabs.count();
  console.log(`   Found ${tabCount} potential tab elements`);
  
  for (let i = 0; i < Math.min(tabCount, 10); i++) {
    const tab = tabs.nth(i);
    const text = await tab.textContent();
    const role = await tab.getAttribute('role');
    const ariaSelected = await tab.getAttribute('aria-selected');
    console.log(`   Tab ${i}: text="${text?.trim()}", role="${role}", aria-selected="${ariaSelected}"`);
  }

  console.log('\n2. Investigating button labels...');
  const allButtons = page.locator('button');
  const allButtonCount = await allButtons.count();
  console.log(`   Total buttons on page: ${allButtonCount}`);
  
  // Look specifically for Validate, Results, Save buttons
  const actionButtons = page.locator('button:has-text(/Validate|Results|Save|Send/i)');
  const actionCount = await actionButtons.count();
  console.log(`   Action buttons found: ${actionCount}`);
  
  for (let i = 0; i < Math.min(actionCount, 10); i++) {
    const btn = actionButtons.nth(i);
    const text = await btn.textContent();
    const dataAttr = await btn.getAttribute('data-test-id');
    const classAttr = await btn.getAttribute('class');
    console.log(`   Action ${i}: "${text?.trim()}", class="${classAttr?.substring(0, 50)}..."`);
  }

  console.log('\n3. Looking for confirmation/success messages...');
  const messages = page.locator('[role="alert"], [aria-live], .alert, [class*="success" i], [class*="confirm" i]');
  const messageCount = await messages.count();
  console.log(`   Potential message elements: ${messageCount}`);

  console.log('\n=== Use debug mode to click through workflow ===');
  await page.pause();
});

/**
 * Investigation: Compensation Management Workspace
 * 
 * Goal: Find correct selectors for:
 * - Workspace tiles/cards
 * - Tile clickability
 * - Back button/breadcrumb navigation
 */
test('INVESTIGATE: Compensation Management workspace selectors', async ({ page }) => {
  test.setTimeout(120000);

  console.log('=== INVESTIGATION: Workspace Tile Selectors ===');
  
  await page.goto('/?cmp=4415&mi=CompensationManagementWorkspace', { waitUntil: 'networkidle' });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.locator('[role="main"]').first().waitFor({ timeout: 45000 });
  await page.waitForTimeout(2000);

  console.log('Current URL:', page.url());

  console.log('\n1. Investigating workspace tiles/cards...');
  const tiles = page.locator('[role="button"], a, [class*="tile" i], [class*="card" i]');
  const tileCount = await tiles.count();
  console.log(`   Found ${tileCount} potential clickable elements`);

  // Look for specific tiles mentioned in ADO tests
  const tilesText = await page.locator('body').textContent();
  const hasMentionedTile = (text: string) => {
    return tilesText?.toLowerCase().includes(text.toLowerCase()) ?? false;
  };

  console.log('\n2. Checking for expected tiles in page content...');
  console.log(`   "Employees ready to pay": ${hasMentionedTile('ready to pay') ? '✓ Found' : '✗ Not found'}`);
  console.log(`   "Employees not ready to pay": ${hasMentionedTile('not ready to pay') ? '✓ Found' : '✗ Not found'}`);
  console.log(`   "Employees with override": ${hasMentionedTile('override') ? '✓ Found' : '✗ Not found'}`);
  console.log(`   "Send payroll file": ${hasMentionedTile('send payroll') ? '✓ Found' : '✗ Not found'}`);

  console.log('\n3. Investigating navigation elements...');
  const backButton = page.locator('button[aria-label*="back" i], button:has-text(/back|←|‹/i)');
  const backCount = await backButton.count();
  console.log(`   Back buttons found: ${backCount}`);

  const breadcrumbs = page.locator('[role="navigation"], nav, [class*="breadcrumb" i]');
  const breadcrumbCount = await breadcrumbs.count();
  console.log(`   Navigation elements found: ${breadcrumbCount}`);

  console.log('\n=== Use debug mode to click tiles and observe navigation ===');
  await page.pause();
});

/**
 * Investigation: Generic Element Finding
 * 
 * Utility test to find ANY element by text content
 * Useful for discovering hard-to-find elements
 */
test('INVESTIGATE: Finding elements by text content', async ({ page }) => {
  test.setTimeout(120000);

  console.log('=== INVESTIGATION: Text-Based Element Finding ===');
  
  // Navigate to any page you want to investigate
  await page.goto('/?cmp=4415&mi=HcmWorkerListPage', { waitUntil: 'networkidle' });
  await page.waitForLoadState('networkidle');
  await page.locator('[role="main"]').first().waitFor({ timeout: 45000 });
  await page.waitForTimeout(2000);

  // List of text strings to search for
  const searchTexts = [
    'Validate',
    'Results',
    'Save',
    'Workers',
    'Payroll',
    'Ready to pay',
    'Override',
  ];

  console.log('\nSearching for common element texts:');
  for (const searchText of searchTexts) {
    const elements = page.locator(`text=${searchText}`);
    const count = await elements.count();
    
    if (count > 0) {
      console.log(`\n  "${searchText}" found: ${count} element(s)`);
      
      // Try different element types
      const btnMatch = page.locator(`button:has-text("${searchText}")`);
      const linkMatch = page.locator(`a:has-text("${searchText}")`);
      const spanMatch = page.locator(`[class*="tab"]:has-text("${searchText}")`);
      
      if (await btnMatch.count() > 0) {
        console.log(`    ✓ Found as button: button:has-text("${searchText}")`);
      }
      if (await linkMatch.count() > 0) {
        console.log(`    ✓ Found as link: a:has-text("${searchText}")`);
      }
      if (await spanMatch.count() > 0) {
        console.log(`    ✓ Found in tab element`);
      }
    }
  }

  console.log('\n=== Review findings and update selectors in conversion tests ===');
});
