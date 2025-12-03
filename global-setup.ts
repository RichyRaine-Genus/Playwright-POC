// global-setup.ts
import { chromium, FullConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function globalSetup(config: FullConfig) {
  const { baseURL, storageState } = config.projects[0].use;
  const browser = await chromium.launch({ headless: false }); // Use headed browser for initial setup/debugging
  const page = await browser.newPage();

  const username = process.env.D365_USERNAME;
  const password = process.env.D365_PASSWORD;

  if (!username || !password || !baseURL) {
    throw new Error("Please set D365_USERNAME, D365_PASSWORD, and baseURL in your .env file or playwright.config.");
  }

  try {
    console.log(`Navigating to login page at ${baseURL}`);
    await page.goto(baseURL);

    // Enter username
    console.log('Entering username...');
    await page.getByLabel('Enter your email, phone, or Skype.').fill(username);
    await page.getByRole('button', { name: 'Next' }).click();

    // Enter password
    console.log('Entering password...');
    // The password field might take a moment to appear after clicking "Next"
    await page.getByPlaceholder('Password').fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Handle "Stay signed in?" prompt
    console.log('Handling "Stay signed in?" prompt...');
    await page.getByRole('button', { name: 'Yes' }).click();

    // IMPORTANT: Wait for a known element on the main dashboard to ensure login is complete
    console.log('Waiting for main dashboard to load...');
    
    // Instead of waiting for URL pattern, wait for the dashboard content to appear
    // This is more reliable as D365 dashboards may not always change the URL
    try {
      // Wait for the main content area to be visible
      await page.locator('[role="main"]').waitFor({ timeout: 60000 });
      console.log('Main dashboard area detected');
    } catch (e) {
      console.log('Could not find [role="main"], trying alternative detection...');
      // Fallback: wait for any substantial content to load
      await page.waitForSelector('body > *', { timeout: 60000 });
    }

    // Wait a bit more for any dynamic content to settle
    await page.waitForLoadState('networkidle').catch(() => {
      console.log('Network did not reach idle state, but continuing anyway');
    });

    console.log('Login successful. Saving authentication state...');
    // Save the authentication state to the file path defined in the config
    await page.context().storageState({ path: storageState as string });
    console.log(`Authentication state saved to ${storageState}`);

  } catch (error) {
    console.error('Login failed during global setup:', error);
    // You might want to take a screenshot on failure for debugging
    await page.screenshot({ path: 'global-setup-failure.png' });
    throw error; // Re-throw the error to fail the test run
  } finally {
    await browser.close();
  }
}

export default globalSetup;