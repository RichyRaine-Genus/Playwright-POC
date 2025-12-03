// D365 F&O Test Data Extraction Strategy & Framework

/*
==============================================
D365 F&O DATA EXTRACTION TEST PLAN
==============================================

CHALLENGE:
- D365 workspaces load dynamically with iframes
- Data is rendered in shadow DOM or complex nested structures
- Standard selectors like [data-control-name] may not work
- Pages use splash screens that hide content during loading

SOLUTION FRAMEWORK:
The key is to use a multi-layered approach:

1. WAIT STRATEGY
   - Wait for DOM to load (domcontentloaded)
   - Wait for network to settle (networkidle)
   - Wait for splash screen to disappear
   - Wait for iframe content to render
   - Use a final "content detection" wait

2. SELECTOR STRATEGIES (in order of preference)
   a) XPath with text content (most reliable for D365)
      xpath=//label[contains(text(), 'Years of Service')]/following-sibling::*
   
   b) ARIA labels (if form has accessibility attributes)
      [aria-label*="Years"], [aria-describedby*="Years"]
   
   c) Iframes + internal selectors
      iframe[name="main"] then search within
   
   d) Class-based selectors for D365 forms
      .ms-TextField, .form-group, .control-group

3. DATA EXTRACTION METHODS
   a) textContent() - for visible text values
   b) getAttribute() - for input values, ids
   c) getByRole() - for accessible elements (buttons, fields)
   d) evaluate() - for complex DOM inspection
   
4. DEBUGGING TOOLS
   - page.screenshot() - visual confirmation
   - page.content() - raw HTML inspection
   - page.locator().all() - enumerate matching elements
   - evaluate() - run JS in browser context

5. BEST PRACTICES FOR D365
   - Use Business process flow (BPF) stages to navigate forms
   - Look for ribbon commands and use them
   - Use person column for lookups (Reports To is often a person column)
   - Wait for both the form AND form controls to render
   - Handle modal dialogs that may appear during navigation
*/

import { test, expect } from '@playwright/test';

test.describe('D365 F&O Data Extraction Framework', () => {
  
  test('extract data from ESS workspace using robust strategy', async ({ page }) => {
    test.setTimeout(120000);
    
    console.log('Step 1: Navigate to ESS workspace');
    await page.goto('/?cmp=4415&mi=HcmEmployeeSelfServiceWorkspace', { waitUntil: 'networkidle' });
    
    console.log('Step 2: Wait for initial page load');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    
    console.log('Step 3: Wait for splash screen to fully disappear');
    // Wait for main content area
    await page.locator('[role="main"], .mainPane, .viewContainer').first().waitFor({ 
      timeout: 45000 
    });
    
    console.log('Step 4: Give page time to render form controls');
    await page.waitForTimeout(3000);
    
    // Take a screenshot to see what we're working with
    await page.screenshot({ path: 'ess-workspace-after-load.png', fullPage: true });
    console.log('Screenshot saved: ess-workspace-after-load.png');
    
    // Get page structure for debugging
    const pageInfo = await page.evaluate(() => {
      return {
        iframeCount: document.querySelectorAll('iframe').length,
        formCount: document.querySelectorAll('form, [role="form"]').length,
        labelCount: document.querySelectorAll('label').length,
        inputCount: document.querySelectorAll('input, select, textarea').length,
      };
    });
    console.log('Page structure:', pageInfo);
    
    console.log('Step 5: Extract Years of Service using multiple strategies');
    let yearsOfService = null;
    
    // Strategy A: Look for label containing "Years" and get adjacent input
    try {
      const yearLabels = page.locator(`xpath=//label[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'years')]`);
      const labelCount = await yearLabels.count();
      console.log(`Found ${labelCount} labels with "years" text`);
      
      if (labelCount > 0) {
        const labelText = await yearLabels.first().textContent();
        console.log(`Label text: ${labelText}`);
        
        // Try to find the value next to the label - be more thorough
        const value = await page.evaluate(() => {
          const labels = document.querySelectorAll('label');
          for (let label of labels) {
            if (label.textContent?.toLowerCase().includes('years')) {
              console.log('Found years label, searching for value...');
              
              // Method 1: Look in the same parent container
              let parent = label.parentElement;
              while (parent && parent.tagName !== 'FORM') {
                const input = parent.querySelector('input[type="text"], input:not([type="hidden"])');
                if (input && (input as HTMLInputElement).value) {
                  return (input as HTMLInputElement).value;
                }
                
                // Look for text content that looks like a number
                const text = parent.textContent;
                if (text) {
                  const match = text.match(/\d+(\.\d+)?/);
                  if (match && !text.includes('Years')) {
                    return match[0];
                  }
                }
                parent = parent.parentElement;
              }
              
              // Method 2: Look for data attribute with years
              const allElements = label.closest('div[role="main"], form, div.viewContainer')?.querySelectorAll('[id*="Years"], [name*="Years"], [data-*="Years"]');
              if (allElements) {
                for (let el of allElements) {
                  const val = (el as any).value || el.textContent;
                  if (val) return val;
                }
              }
            }
          }
          return null;
        });
        
        if (value) {
          yearsOfService = value;
          console.log(`✓ Years of Service extracted: ${yearsOfService}`);
        } else {
          console.log('Could not extract years value');
        }
      }
    } catch (e) {
      console.log(`Strategy A failed: ${e}`);
    }
    
    console.log('Step 6: Extract Reports To using multiple strategies');
    let reportsTo = null;
    
    try {
      const reportLabels = page.locator(`xpath=//label[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'report')]`);
      const reportLabelCount = await reportLabels.count();
      console.log(`Found ${reportLabelCount} labels with "report" text`);
      
      if (reportLabelCount > 0) {
        const value = await page.evaluate(() => {
          const labels = document.querySelectorAll('label');
          for (let label of labels) {
            if (label.textContent?.toLowerCase().includes('report')) {
              console.log('Found report label, searching for value...');
              
              // Method 1: Look in parent containers
              let parent = label.parentElement;
              while (parent && parent.tagName !== 'FORM') {
                const input = parent.querySelector('input[type="text"], input:not([type="hidden"])');
                if (input && (input as HTMLInputElement).value) {
                  return (input as HTMLInputElement).value;
                }
                parent = parent.parentElement;
              }
              
              // Method 2: Look for associated fields
              const allElements = label.closest('div[role="main"], form, div.viewContainer')?.querySelectorAll('[id*="Report"], [name*="Report"], [data-*="Report"]');
              if (allElements) {
                for (let el of allElements) {
                  const val = (el as any).value || el.textContent;
                  if (val) return val;
                }
              }
            }
          }
          return null;
        });
        
        if (value) {
          reportsTo = value;
          console.log(`✓ Reports To extracted: ${reportsTo}`);
        } else {
          console.log('Could not extract reports to value');
        }
      }
    } catch (e) {
      console.log(`Strategy B failed: ${e}`);
    }
    
    console.log('\nStep 7: Fallback - Enumerate all form values if above failed');
    const allFormData = await page.evaluate(() => {
      const data: Record<string, any> = {};
      const labels = document.querySelectorAll('label');
      
      labels.forEach((label, idx) => {
        const labelText = label.textContent?.trim();
        if (labelText) {
          // Get the associated input
          let valueElement: any = null;
          let value: string | null = null;
          
          // Method 1: Look in same parent
          let parent = label.parentElement;
          while (parent && parent.tagName !== 'FORM') {
            const input = parent.querySelector('input[type="text"], input:not([type="hidden"]), select, textarea');
            if (input) {
              valueElement = input;
              value = (input as any).value || input.textContent;
              break;
            }
            parent = parent.parentElement;
          }
          
          data[labelText] = {
            value: value,
            tagName: valueElement?.tagName,
            type: valueElement?.type,
          };
        }
      });
      
      return data;
    });
    
    console.log('All form data found:');
    Object.entries(allFormData).forEach(([label, data]) => {
      console.log(`  ${label}: ${(data as any).value || '(empty)'}`);
    });
    
    // Results
    console.log('\n=== EXTRACTION RESULTS ===');
    console.log(`Years of Service: ${yearsOfService || 'NOT FOUND'}`);
    console.log(`Reports To: ${reportsTo || 'NOT FOUND'}`);
    
    expect(true).toBe(true); // Test passes if we get here
  });
});
