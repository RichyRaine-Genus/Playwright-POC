import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Define the path to the file that will store the authentication state
const authFile = 'playwright/.auth/user.json';

export default defineConfig({
  // Run this file before all tests to log in
  globalSetup: require.resolve('./global-setup'),

  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 60000, // 60 second timeout per test
  expect: {
    timeout: 10000, // 10 second timeout for assertions
  },

  use: {
    // Use the D365 URL from the .env file as the base for all tests
    baseURL: process.env.D365_URL,

    // Tell all tests to use the saved authentication state
    storageState: authFile,

    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

