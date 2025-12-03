// tests/inspectESS-debug.spec.ts
import { test, expect } from '@playwright/test';

test.describe('ESS Workspace Inspector - DEBUG ONLY', () => {
  test('inspect ESS workspace structure and find control selectors', async ({ page }) => {
    test.setTimeout(120000);

    console.log('Navigating to ESS workspace...');
    await page.goto('/?cmp=4415&mi=HcmEmployeeSelfServiceWorkspace', { waitUntil: 'networkidle' });
    
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    
    // Wait for main content
    await page.locator('[role="main"]').waitFor({ timeout: 30000 });

    console.log('=== ESS WORKSPACE INSPECTION ===\n');

    // Wait for splash screen to disappear
    console.log('Waiting for splash screen to disappear...');
    await page.locator('#splashScreen').evaluate(el => {
      if (el) el.style.visibility = 'hidden';
    }).catch(() => {});
    
    // Wait for actual content to load
    await page.waitForSelector('.navigationPane, [role="main"], .form-group, form', { timeout: 30000 }).catch(() => {
      console.log('Timeout waiting for form content, continuing anyway...');
    });

    // Give a bit more time for dynamic content
    await page.waitForTimeout(2000);

    // 1. Get all visible text content
    console.log('=== ALL VISIBLE TEXT ON PAGE ===');
    const bodyText = await page.locator('body').textContent();
    console.log(bodyText?.substring(0, 2000)); // First 2000 chars

    // 2. Look for common D365 control containers
    console.log('\n=== LOOKING FOR FORM CONTROLS ===');
    const controls = page.locator('[data-control-name]');
    const controlCount = await controls.count();
    console.log(`Found ${controlCount} elements with data-control-name attribute`);
    
    for (let i = 0; i < Math.min(controlCount, 20); i++) {
      const controlName = await controls.nth(i).getAttribute('data-control-name');
      const text = await controls.nth(i).textContent();
      console.log(`[${i}] data-control-name="${controlName}" -> "${text?.substring(0, 50)}"`);
    }

    // 3. Look for common D365 form elements
    console.log('\n=== LOOKING FOR COMMON D365 ELEMENTS ===');
    const formGroups = page.locator('.form-group, .control-group, [role="form"]');
    const formCount = await formGroups.count();
    console.log(`Found ${formCount} form group elements`);
    
    const inspect = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const results = {
        classes: new Set<string>(),
        ids: new Set<string>(),
        dataAttrs: new Set<string>(),
      };
      
      for (let i = 0; i < Math.min(elements.length, 500); i++) {
        const el = elements[i];
        if (el.className) {
          const classes = String(el.className).split(' ').filter(c => c.length > 0);
          classes.forEach(c => results.classes.add(c));
        }
        if (el.id) results.ids.add(el.id);
        
        Array.from(el.attributes).forEach(attr => {
          if (attr.name.startsWith('data-')) {
            results.dataAttrs.add(attr.name);
          }
        });
      }
      
      return {
        classNames: Array.from(results.classes).slice(0, 50),
        ids: Array.from(results.ids).slice(0, 50),
        dataAttrs: Array.from(results.dataAttrs).slice(0, 50),
      };
    });
    
    console.log('CSS Classes found:', inspect.classNames);
    console.log('IDs found:', inspect.ids);
    console.log('Data attributes found:', inspect.dataAttrs);

    // 4. Search for specific keywords
    console.log('\n=== SEARCHING FOR KEYWORDS ===');
    const keywords = ['Years', 'Service', 'Reports', 'Manager', 'Employment', 'Position'];
    
    for (const keyword of keywords) {
      try {
        const xpath = `//*[contains(text(), '${keyword}')]`;
        const elements = page.locator(`xpath=${xpath}`);
        const count = await elements.count();
        console.log(`Found ${count} elements containing "${keyword}"`);
      } catch (e) {
        console.log(`Could not search for "${keyword}"`);
      }
    }

    // 5. Look for form groups and field labels
    console.log('\n=== LOOKING FOR FORM STRUCTURE ===');
    const labels = page.locator('label');
    const labelCount = await labels.count();
    console.log(`Found ${labelCount} label elements`);
    
    for (let i = 0; i < Math.min(labelCount, 15); i++) {
      const labelText = await labels.nth(i).textContent();
      console.log(`Label[${i}]: "${labelText}"`);
    }

    // 6. Look for input/select elements
    console.log('\n=== LOOKING FOR INPUT ELEMENTS ===');
    const inputs = page.locator('input, select, textarea');
    const inputCount = await inputs.count();
    console.log(`Found ${inputCount} input elements`);
    
    for (let i = 0; i < Math.min(inputCount, 15); i++) {
      const input = inputs.nth(i);
      const placeholder = await input.getAttribute('placeholder');
      const value = await input.inputValue().catch(() => '(no value)');
      const ariaLabel = await input.getAttribute('aria-label');
      console.log(`Input[${i}]: placeholder="${placeholder}" value="${value}" aria-label="${ariaLabel}"`);
    }

    // 7. Page source snippet for manual inspection
    console.log('\n=== FULL PAGE HTML (first 5000 chars) ===');
    const pageSource = await page.content();
    console.log(pageSource.substring(0, 5000));

    // Take a screenshot for visual inspection
    await page.screenshot({ path: 'ess-workspace-debug.png' });
    console.log('\n✓ Screenshot saved to ess-workspace-debug.png');

    expect(true).toBe(true); // Always pass to see all logs
  });
});
