// tests/inspectDOM-debug.spec.ts
/**
 * Deep DOM inspection to understand the actual form structure
 * and why we're getting incorrect values
 */

import { test, expect } from '@playwright/test';

test.describe('DOM Structure Deep Inspection', () => {
  test('inspect exact form element relationships', async ({ page }) => {
    test.setTimeout(120000);

    console.log('Navigating to ESS workspace...');
    await page.goto('/?cmp=4415&mi=HcmEmployeeSelfServiceWorkspace', { waitUntil: 'networkidle' });
    
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    await page.locator('[role="main"]').first().waitFor({ timeout: 45000 });
    await page.waitForTimeout(2000);

    console.log('\n=== DEEP DOM INSPECTION ===\n');

    const inspection = await page.evaluate(() => {
      const results: Record<string, any> = {};
      const labels = document.querySelectorAll('label');
      
      labels.forEach((label) => {
        const labelText = label.textContent?.trim();
        if (!labelText || labelText.length === 0 || labelText.length > 100) return;
        
        const labelInfo: any = {
          labelText,
          labelId: label.id,
          labelFor: label.getAttribute('for'),
          parentClass: label.parentElement?.className,
          parentTag: label.parentElement?.tagName,
          nearbyElements: [],
        };

        // Find all elements within 3 levels up
        let current = label;
        for (let level = 0; level < 6 && current; level++) {
          current = current.parentElement as any;
          if (!current || current.tagName === 'FORM') break;

          // Find all inputs at this level (direct children and nested)
          const allInputs = current.querySelectorAll('input, select, textarea, [role="combobox"], [role="textbox"]');
          
          allInputs.forEach((inp: any) => {
            const value = inp.value || inp.textContent?.trim();
            if (value) {
              labelInfo.nearbyElements.push({
                level,
                tag: inp.tagName,
                type: inp.type,
                role: inp.getAttribute('role'),
                value: value.substring(0, 100),
                id: inp.id,
                name: inp.name,
                ariaLabel: inp.getAttribute('aria-label'),
                ariaLabelledBy: inp.getAttribute('aria-labelledby'),
                className: inp.className,
                visible: inp.offsetHeight > 0 && inp.offsetWidth > 0,
                // Check if it's visually associated
                isDirectChild: inp.parentElement === label.parentElement,
                parentTag: inp.parentElement?.tagName,
                parentClass: inp.parentElement?.className,
              });
            }
          });

          // Also capture direct text near the label
          const textContent = current.textContent?.trim().substring(0, 150);
          if (textContent && textContent !== labelText && level === 0) {
            labelInfo.nearbyText = textContent;
          }
        }

        results[labelText] = labelInfo;
      });

      return results;
    });

    // Pretty print results
    Object.entries(inspection).forEach(([label, info]: [string, any]) => {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`LABEL: "${label}"`);
      console.log(`  Label ID: ${info.labelId || '(none)'}`);
      console.log(`  Label For: ${info.labelFor || '(none)'}`);
      console.log(`  Parent: <${info.parentTag} class="${info.parentClass}">`);
      
      if (info.nearbyElements.length === 0) {
        console.log(`  ❌ NO INPUTS FOUND`);
      } else {
        console.log(`  📝 Nearby elements found: ${info.nearbyElements.length}`);
        
        info.nearbyElements.forEach((el: any, idx: number) => {
          const visibility = el.visible ? '✓' : '✗';
          const associated = el.isDirectChild ? ' [DIRECT SIBLING]' : '';
          console.log(`    [${idx}] ${visibility} Level ${el.level}: <${el.tag} type="${el.type}"> = "${el.value}"${associated}`);
          if (el.role) console.log(`         role="${el.role}"`);
          if (el.ariaLabel) console.log(`         aria-label="${el.ariaLabel}"`);
          if (el.ariaLabelledBy) console.log(`         aria-labelledby="${el.ariaLabelledBy}"`);
          console.log(`         class="${el.parentClass}"`);
        });
      }
    });

    // Now try to identify the pattern
    console.log('\n\n=== PATTERN ANALYSIS ===\n');

    const patterns = await page.evaluate(() => {
      const labelToValue: Record<string, string[]> = {};
      const labels = document.querySelectorAll('label');

      labels.forEach((label) => {
        const labelText = label.textContent?.trim();
        if (!labelText || labelText.length === 0 || labelText.length > 100) return;

        const values: string[] = [];

        // Strategy 1: aria-labelledby
        const ariaId = label.getAttribute('id');
        if (ariaId) {
          const element = document.querySelector(`[aria-labelledby="${ariaId}"]`);
          if (element) {
            const val = (element as any).value || element.textContent;
            if (val) values.push(`aria: ${val}`);
          }
        }

        // Strategy 2: look for id=label.for
        const labelFor = label.getAttribute('for');
        if (labelFor) {
          const element = document.getElementById(labelFor);
          if (element) {
            const val = (element as any).value || element.textContent;
            if (val) values.push(`label-for: ${val}`);
          }
        }

        // Strategy 3: Next visible input
        let next = label.nextElementSibling as any;
        for (let i = 0; i < 5 && next; i++) {
          if (next.tagName === 'INPUT' || next.tagName === 'SELECT' || next.tagName === 'TEXTAREA') {
            if (next.value) {
              values.push(`next-${i}: ${next.value}`);
              break;
            }
          }
          next = next.nextElementSibling;
        }

        // Strategy 4: Next visible input in parent container
        let parent = label.parentElement;
        for (let level = 0; level < 4 && parent; level++) {
          const inputs = parent.querySelectorAll(':scope > input, :scope > div > input');
          for (let inp of inputs) {
            if ((inp as any).value && !values.find(v => v.includes((inp as any).value))) {
              values.push(`parent-${level}: ${(inp as any).value}`);
              break;
            }
          }
          parent = parent.parentElement;
        }

        labelToValue[labelText] = values;
      });

      return labelToValue;
    });

    console.log('VALUE DISCOVERY PATTERNS:');
    Object.entries(patterns).forEach(([label, values]) => {
      if (values.length > 0) {
        console.log(`\n"${label}":`);
        values.forEach(v => console.log(`  - ${v}`));
      }
    });

    expect(true).toBe(true);
  });
});
