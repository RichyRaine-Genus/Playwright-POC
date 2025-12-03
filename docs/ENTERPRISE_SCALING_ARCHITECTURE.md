# D365 F&O Playwright Framework — Enterprise Scaling Architecture

## Executive Summary

This document describes how to scale the Playwright testing framework across an enterprise with multiple value streams (HR, Finance, Supply Chain, etc.), enabling:

- **Centralized Test Repository**: Single source of truth for all test scripts
- **Test Categorization**: Tags organize tests by value stream, risk level, and execution context
- **Dynamic Pipeline Selection**: Pipelines pull specific test subsets based on context
- **Reusable Helpers & Fixtures**: Shared patterns across all value streams
- **Multi-Environment Execution**: Same tests run across DEV, TEST, STAGING, PROD validation
- **Cost Optimization**: Only run relevant tests (no wasted CI/CD minutes)

**Outcome**: A scalable, maintainable testing infrastructure that grows with your organization.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                 Central Test Repository                      │
│                  (Git + ADO)                                 │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ /tests                                                 │  │
│  │  ├── /hr                 (HR value stream)            │  │
│  │  │   ├── payroll-*.spec.ts                           │  │
│  │  │   ├── leave-*.spec.ts                             │  │
│  │  │   └── recruitment-*.spec.ts                       │  │
│  │  │                                                     │  │
│  │  ├── /finance              (Finance value stream)     │  │
│  │  │   ├── ap-*.spec.ts                                │  │
│  │  │   ├── ar-*.spec.ts                                │  │
│  │  │   └── gl-*.spec.ts                                │  │
│  │  │                                                     │  │
│  │  ├── /supply-chain         (Supply Chain value stream)│  │
│  │  │   ├── procurement-*.spec.ts                       │  │
│  │  │   ├── inventory-*.spec.ts                         │  │
│  │  │   └── order-fulfillment-*.spec.ts                │  │
│  │  │                                                     │  │
│  │  └── /shared               (Cross-stream tests)       │  │
│  │      ├── general-ledger-*.spec.ts                    │  │
│  │      └── master-data-*.spec.ts                       │  │
│  │                                                         │  │
│  │ /helpers                                               │  │
│  │  ├── d365-form-utils.ts     (Core extraction)        │  │
│  │  ├── hr-specific-helpers.ts (HR domain logic)        │  │
│  │  ├── finance-helpers.ts     (Finance domain logic)   │  │
│  │  └── payment-helpers.ts     (Shared payment logic)   │  │
│  │                                                         │  │
│  │ /test-config                                          │  │
│  │  ├── test-tags.json         (Tag definitions)        │  │
│  │  ├── test-matrix.json       (Environment matrix)     │  │
│  │  └── test-groups.json       (Pipeline groupings)     │  │
│  │                                                         │  │
│  │ /pipelines                                            │  │
│  │  ├── ci-on-commit.yaml      (Every commit)           │  │
│  │  ├── nightly-regression.yaml (Full suite)            │  │
│  │  ├── pre-upgrade.yaml       (Upgrade baseline)       │  │
│  │  └── release-gate.yaml      (Production readiness)   │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                              ↓
         ┌────────────────────┼────────────────────┐
         ↓                    ↓                    ↓
    ┌─────────┐          ┌─────────┐          ┌──────────┐
    │ HR Dev  │          │Fin Dev  │          │ Supply   │
    │Pipeline │          │Pipeline │          │Chain Dev │
    │ (10 min)│          │ (12 min)│          │Pipeline  │
    └─────────┘          └─────────┘          │ (15 min) │
         ↓                    ↓                └──────────┘
    ┌─────────────────────────────────────────────────────┐
    │ Test Results Dashboard (HTML Reports, Metrics)      │
    │ - Per-pipeline metrics                              │
    │ - Cross-stream regression alerts                    │
    │ - Performance trends                                │
    └─────────────────────────────────────────────────────┘
```

---

## 1. Test Organization & Tagging Strategy

### Directory Structure by Value Stream

```
tests/
├── hr/                          # HR value stream
│   ├── payroll-validation.spec.ts        @hr @payroll @critical
│   ├── payroll-ready-to-pay.spec.ts      @hr @payroll @critical
│   ├── leave-request-approval.spec.ts    @hr @leave @important
│   ├── recruitment-workflow.spec.ts      @hr @recruitment @low
│   └── employee-profile.spec.ts          @hr @employee @important
│
├── finance/                     # Finance value stream
│   ├── ap-invoice-processing.spec.ts     @finance @ap @critical
│   ├── ar-order-to-cash.spec.ts          @finance @ar @critical
│   ├── gl-period-close.spec.ts           @finance @gl @important
│   └── cash-flow-forecast.spec.ts        @finance @gl @low
│
├── supply-chain/                # Supply Chain value stream
│   ├── procurement-orders.spec.ts        @supply-chain @procurement @important
│   ├── inventory-adjustment.spec.ts      @supply-chain @inventory @important
│   ├── order-fulfillment.spec.ts         @supply-chain @fulfillment @critical
│   └── warehouse-management.spec.ts      @supply-chain @warehouse @low
│
└── shared/                      # Cross-stream tests
    ├── master-data-sync.spec.ts          @shared @master-data @important
    ├── audit-trail.spec.ts               @shared @audit @critical
    └── security-access.spec.ts           @shared @security @critical
```

### Tagging Convention

Every test is tagged with metadata for selective execution:

```typescript
// Example test with tags
test('ADO #54321: Process payroll for ready-to-pay employees @hr @payroll @critical @ci @regression', 
  async ({ page }) => {
    // test implementation
  }
);
```

**Tag Categories:**

| Category | Examples | Purpose |
|----------|----------|---------|
| **Value Stream** | @hr, @finance, @supply-chain, @shared | Organize by business domain |
| **Risk Level** | @critical, @important, @low | Prioritize test execution |
| **Execution Context** | @ci, @regression, @upgrade, @smoke | Determine when/where to run |
| **Functional Area** | @payroll, @leave, @ap, @inventory | Fine-grained categorization |
| **Environment** | @dev, @test, @staging, @prod | Environment-specific tests |

### Test Configuration Files

**`test-config/test-tags.json`** — Define and document all tags:

```json
{
  "value_streams": {
    "hr": { "label": "Human Resources", "description": "HR and payroll workflows" },
    "finance": { "label": "Finance", "description": "Accounting and GL" },
    "supply_chain": { "label": "Supply Chain", "description": "Procurement and inventory" },
    "shared": { "label": "Shared", "description": "Cross-stream functionality" }
  },
  "risk_levels": {
    "critical": { "label": "Critical", "description": "Core business functionality" },
    "important": { "label": "Important", "description": "Significant business impact" },
    "low": { "label": "Low", "description": "Nice-to-have, limited impact" }
  },
  "execution_context": {
    "ci": { "label": "CI/CD", "description": "Run on every commit" },
    "regression": { "label": "Regression", "description": "Full regression suite" },
    "upgrade": { "label": "Upgrade", "description": "Pre/post platform upgrade" },
    "smoke": { "label": "Smoke", "description": "Quick health check" }
  }
}
```

---

## 2. Test Grouping & Pipeline Strategy

### Define Test Groups

**`test-config/test-groups.json`** — Map test groups to pipeline scenarios:

```json
{
  "groups": {
    "ci-smoke": {
      "description": "Fast CI gate (5–10 min): critical tests only",
      "filters": ["@critical", "@ci"],
      "timeout_per_test": 60,
      "max_parallel_workers": 4
    },
    "hr-daily": {
      "description": "Daily HR regression (30 min)",
      "filters": ["@hr", "@regression"],
      "timeout_per_test": 120,
      "max_parallel_workers": 8
    },
    "finance-daily": {
      "description": "Daily Finance regression (30 min)",
      "filters": ["@finance", "@regression"],
      "timeout_per_test": 120,
      "max_parallel_workers": 8
    },
    "supply-chain-daily": {
      "description": "Daily Supply Chain regression (45 min)",
      "filters": ["@supply-chain", "@regression"],
      "timeout_per_test": 120,
      "max_parallel_workers": 8
    },
    "nightly-full": {
      "description": "Full suite nightly (2–3 hours)",
      "filters": ["@regression", "@ci"],
      "timeout_per_test": 120,
      "max_parallel_workers": 12
    },
    "pre-upgrade": {
      "description": "Pre-upgrade baseline (45 min)",
      "filters": ["@upgrade"],
      "timeout_per_test": 180,
      "max_parallel_workers": 6,
      "record_baseline": true
    },
    "post-upgrade": {
      "description": "Post-upgrade validation vs baseline",
      "filters": ["@upgrade"],
      "timeout_per_test": 180,
      "max_parallel_workers": 6,
      "compare_to_baseline": true
    }
  }
}
```

### Execution Model: CLI with Test Filtering

**Enhanced `playwright.config.ts`** to support test groups:

```typescript
import { defineConfig, devices } from '@playwright/test';
import * as fs from 'fs';

// Load test group config
const testGroups = JSON.parse(fs.readFileSync('./test-config/test-groups.json', 'utf8'));
const selectedGroup = process.env.TEST_GROUP || 'ci-smoke';
const groupConfig = testGroups.groups[selectedGroup];

if (!groupConfig) {
  throw new Error(`Unknown test group: ${selectedGroup}`);
}

export default defineConfig({
  testDir: './tests',
  
  // Filter tests based on group
  testMatch: (fileName) => {
    // Read file and check if it has required tags
    const content = fs.readFileSync(fileName, 'utf8');
    return groupConfig.filters.every(filter => content.includes(filter));
  },

  timeout: groupConfig.timeout_per_test * 1000,
  fullyParallel: true,
  workers: groupConfig.max_parallel_workers,

  use: {
    baseURL: process.env.D365_URL,
    storageState: 'playwright/.auth/user.json',
  },

  reporter: [
    ['html', { outputFolder: `test-results/${selectedGroup}` }],
    ['json', { outputFile: `test-results/${selectedGroup}/results.json` }],
  ],
});
```

---

## 3. ADO Pipeline Integration

### CI Pipeline: On Every Commit (Fast Gate)

**`pipelines/ci-on-commit.yaml`**:

```yaml
trigger:
  - main
  - develop

pr:
  - main
  - develop

pool:
  vmImage: 'ubuntu-latest'

variables:
  TEST_GROUP: 'ci-smoke'
  TIMEOUT: 300

stages:
  - stage: FastCI
    displayName: 'Fast CI Gate (Critical Tests)'
    jobs:
      - job: RunTests
        displayName: 'Run Smoke Tests'
        timeoutInMinutes: 10

        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: '18.x'

          - script: npm ci
            displayName: 'Install dependencies'

          - script: npx playwright install --with-deps
            displayName: 'Install browsers'

          - script: |
              npx playwright test --reporter=html
            displayName: 'Run Smoke Tests'
            env:
              TEST_GROUP: $(TEST_GROUP)
              D365_URL: $(D365_DEV_URL)
              D365_USERNAME: $(D365_USERNAME)
              D365_PASSWORD: $(D365_PASSWORD)

          - task: PublishBuildArtifacts@1
            inputs:
              pathToPublish: 'test-results/ci-smoke'
              artifactName: 'test-results-ci-smoke'
            condition: always()

          - task: PublishTestResults@2
            inputs:
              testResultsFormat: 'JUnit'
              testResultsFiles: 'test-results/ci-smoke/results.json'
            condition: always()
```

### Nightly Pipeline: Full Regression (All Tests)

**`pipelines/nightly-regression.yaml`**:

```yaml
trigger:
  - none  # Manual or scheduled

schedules:
  - cron: '0 22 * * *'  # 10 PM daily
    displayName: 'Nightly Regression'
    branches:
      include:
        - main

pool:
  vmImage: 'ubuntu-latest'

variables:
  TEST_GROUP: 'nightly-full'

stages:
  - stage: NightlyRegression
    displayName: 'Nightly Full Regression'
    jobs:
      - job: HRTests
        displayName: 'HR Tests'
        steps:
          - template: steps/run-test-group.yml
            parameters:
              testGroup: 'hr-daily'
              timeout: 30

      - job: FinanceTests
        displayName: 'Finance Tests'
        steps:
          - template: steps/run-test-group.yml
            parameters:
              testGroup: 'finance-daily'
              timeout: 30

      - job: SupplyChainTests
        displayName: 'Supply Chain Tests'
        steps:
          - template: steps/run-test-group.yml
            parameters:
              testGroup: 'supply-chain-daily'
              timeout: 45

      - job: SharedTests
        displayName: 'Shared Tests'
        dependsOn:
          - HRTests
          - FinanceTests
          - SupplyChainTests
        steps:
          - template: steps/run-test-group.yml
            parameters:
              testGroup: 'nightly-full'
              timeout: 60

  - stage: ReportAndNotify
    displayName: 'Consolidate Results & Notify'
    dependsOn: NightlyRegression
    condition: always()
    jobs:
      - job: ConsolidateResults
        displayName: 'Consolidate and Report'
        steps:
          - script: |
              echo "Consolidating results from all test groups..."
              # Merge JSON results
              node scripts/consolidate-results.js
            displayName: 'Merge Test Results'

          - task: PublishTestResults@2
            inputs:
              testResultsFormat: 'JUnit'
              testResultsFiles: 'test-results/consolidated/results.json'
            displayName: 'Publish Consolidated Results'

          - script: |
              node scripts/send-slack-notification.js
            displayName: 'Send Slack Notification'
            condition: always()
```

### Pre/Post-Upgrade Pipeline

**`pipelines/upgrade-validation.yaml`**:

```yaml
trigger:
  - none  # Manual

pool:
  vmImage: 'ubuntu-latest'

stages:
  - stage: PreUpgrade
    displayName: 'Pre-Upgrade Baseline'
    jobs:
      - job: BaselineRun
        displayName: 'Capture Baseline'
        steps:
          - template: steps/run-test-group.yml
            parameters:
              testGroup: 'pre-upgrade'
              recordBaseline: true

  - stage: UpgradeExecuted
    displayName: 'Platform Upgrade (Manual Step)'
    jobs:
      - job: WaitForUpgrade
        displayName: 'Awaiting Upgrade Completion'
        steps:
          - script: echo "Upgrade in progress. Waiting for completion..."

  - stage: PostUpgrade
    displayName: 'Post-Upgrade Regression'
    dependsOn: UpgradeExecuted
    jobs:
      - job: ValidationRun
        displayName: 'Run Validation & Compare'
        steps:
          - template: steps/run-test-group.yml
            parameters:
              testGroup: 'post-upgrade'
              compareToBaseline: true
```

### Reusable Pipeline Step Template

**`pipelines/steps/run-test-group.yml`**:

```yaml
parameters:
  - name: testGroup
    type: string
  - name: timeout
    type: number
    default: 30
  - name: recordBaseline
    type: boolean
    default: false
  - name: compareToBaseline
    type: boolean
    default: false

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '18.x'

  - script: npm ci
    displayName: 'Install dependencies'

  - script: npx playwright install --with-deps
    displayName: 'Install browsers'

  - script: |
      npx playwright test --reporter=html --reporter=json
    displayName: 'Run Test Group: ${{ parameters.testGroup }}'
    timeoutInMinutes: ${{ parameters.timeout }}
    env:
      TEST_GROUP: ${{ parameters.testGroup }}
      D365_URL: $(D365_TEST_URL)
      D365_USERNAME: $(D365_USERNAME)
      D365_PASSWORD: $(D365_PASSWORD)
      RECORD_BASELINE: ${{ parameters.recordBaseline }}
      COMPARE_BASELINE: ${{ parameters.compareToBaseline }}

  - script: |
      node scripts/post-process-results.js --group=${{ parameters.testGroup }}
    displayName: 'Post-Process Results'
    condition: always()

  - task: PublishBuildArtifacts@1
    inputs:
      pathToPublish: 'test-results/${{ parameters.testGroup }}'
      artifactName: 'results-${{ parameters.testGroup }}'
    condition: always()
```

---

## 4. Centralized Helper Libraries by Domain

### Project Structure

```
helpers/
├── d365-form-utils.ts          # Core extraction (all value streams)
├── d365-navigation-utils.ts    # URL navigation helpers
├── d365-auth-utils.ts          # Authentication & session mgmt
│
├── hr/
│   ├── payroll-helpers.ts      # Payroll-specific extraction
│   ├── leave-helpers.ts        # Leave request helpers
│   └── employee-helpers.ts     # Employee profile helpers
│
├── finance/
│   ├── invoice-helpers.ts      # AP/AR invoice handling
│   ├── gl-helpers.ts           # General ledger helpers
│   └── payment-helpers.ts      # Payment processing
│
└── supply-chain/
    ├── procurement-helpers.ts  # Purchase order helpers
    ├── inventory-helpers.ts    # Inventory transaction helpers
    └── warehouse-helpers.ts    # Warehouse management
```

### Example: Shared Payment Helper (Used by Multiple Value Streams)

**`helpers/finance/payment-helpers.ts`**:

```typescript
import { Page } from '@playwright/test';
import { extractFieldValue } from '../d365-form-utils';

/**
 * Process a payment in D365
 * Used by: Finance (AP/AR), HR (Employee reimbursement), Supply Chain (Vendor payments)
 */
export async function processPayment(
  page: Page,
  paymentDetails: {
    payee: string;
    amount: number;
    date: string;
    method: 'ACH' | 'Check' | 'Wire';
  }
): Promise<{ paymentId: string; status: string }> {
  // Navigate to payment screen
  await page.goto('/?cmp=4415&mi=PaymentProcessing', { waitUntil: 'networkidle' });

  // Fill in payment details using helpers
  await page.locator('input[aria-label*="Payee"]').fill(paymentDetails.payee);
  await page.locator('input[aria-label*="Amount"]').fill(String(paymentDetails.amount));
  await page.locator('input[aria-label*="Date"]').fill(paymentDetails.date);

  // Select payment method dropdown
  await page.locator('select[aria-label*="Payment Method"]').selectOption(paymentDetails.method);

  // Submit
  await page.locator('button:has-text("Process Payment")').click();

  // Verify and return confirmation
  const paymentId = await extractFieldValue(page, 'Payment ID');
  const status = await extractFieldValue(page, 'Status');

  return { paymentId: paymentId || '', status: status || 'Submitted' };
}

export async function verifyPaymentStatus(
  page: Page,
  paymentId: string,
  expectedStatus: string
): Promise<boolean> {
  await page.goto(`/?cmp=4415&mi=PaymentSearch&id=${paymentId}`, { waitUntil: 'networkidle' });

  const actualStatus = await extractFieldValue(page, 'Status');
  return actualStatus === expectedStatus;
}
```

### Example: HR Payroll Helper (Used Only by HR Value Stream)

**`helpers/hr/payroll-helpers.ts`**:

```typescript
import { Page } from '@playwright/test';
import { extractFieldValue, extractAllFormFields } from '../d365-form-utils';

export async function validateEmployeeReadyToPay(
  page: Page,
  employeeId: string
): Promise<boolean> {
  await page.goto('/?cmp=4415&mi=HcmWorkerListPage', { waitUntil: 'networkidle' });

  // Search for employee
  await page.locator('input[aria-label*="Search"]').fill(employeeId);
  await page.locator(`text=${employeeId}`).first().click();
  await page.waitForLoadState('networkidle');

  // Click Payroll tab
  await page.locator('text=Payroll').click();

  // Click Validate
  await page.locator('button:has-text("Validate")').click();

  // Wait for confirmation
  const confirmation = page.locator('text=/validation|ready/i');
  await confirmation.waitFor({ timeout: 10000 });

  return await confirmation.isVisible();
}

export async function extractPayrollData(
  page: Page,
  employeeId: string
): Promise<Record<string, string | null>> {
  await page.goto('/?cmp=4415&mi=HcmWorkerListPage', { waitUntil: 'networkidle' });

  // Navigate to employee
  await page.locator('input[aria-label*="Search"]').fill(employeeId);
  await page.locator(`text=${employeeId}`).first().click();
  await page.waitForLoadState('networkidle');

  // Click Payroll tab
  await page.locator('text=Payroll').click();

  // Extract all fields
  return await extractAllFormFields(page);
}
```

---

## 5. Environment & Configuration Management

### Multi-Environment Test Matrix

**`test-config/test-matrix.json`**:

```json
{
  "environments": {
    "dev": {
      "url": "https://dev.axcloud.dynamics.com",
      "legal_entities": ["4415", "1001"],
      "tags": ["@dev"],
      "run_critical_only": false
    },
    "test": {
      "url": "https://test.axcloud.dynamics.com",
      "legal_entities": ["4415", "1001", "2002"],
      "tags": ["@test"],
      "run_critical_only": true
    },
    "staging": {
      "url": "https://staging.axcloud.dynamics.com",
      "legal_entities": ["4415", "1001"],
      "tags": ["@staging"],
      "run_critical_only": true
    },
    "prod": {
      "url": "https://prod.axcloud.dynamics.com",
      "legal_entities": ["4415"],
      "tags": ["@prod"],
      "run_critical_only": true,
      "read_only": true
    }
  }
}
```

### Configuration Script

**`scripts/select-test-group.js`**:

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Usage: node select-test-group.js --group=hr-daily --env=test

const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.split('=');
  acc[key.replace('--', '')] = value;
  return acc;
}, {});

const testGroups = JSON.parse(fs.readFileSync(path.join(__dirname, '../test-config/test-groups.json'), 'utf8'));
const envMatrix = JSON.parse(fs.readFileSync(path.join(__dirname, '../test-config/test-matrix.json'), 'utf8'));

const group = args.group || 'ci-smoke';
const env = args.env || 'dev';

if (!testGroups.groups[group]) {
  console.error(`Invalid test group: ${group}`);
  process.exit(1);
}

if (!envMatrix.environments[env]) {
  console.error(`Invalid environment: ${env}`);
  process.exit(1);
}

// Output env vars for pipeline consumption
console.log(`TEST_GROUP=${group}`);
console.log(`ENVIRONMENT=${env}`);
console.log(`D365_URL=${envMatrix.environments[env].url}`);
console.log(`LEGAL_ENTITIES=${envMatrix.environments[env].legal_entities.join(',')}`);
```

---

## 6. Results Consolidation & Dashboarding

### Consolidate Multi-Pipeline Results

**`scripts/consolidate-results.js`**:

```javascript
const fs = require('fs');
const path = require('path');

const resultDirs = [
  'test-results/hr-daily',
  'test-results/finance-daily',
  'test-results/supply-chain-daily',
];

const consolidated = {
  timestamp: new Date().toISOString(),
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
  },
  by_value_stream: {},
};

for (const dir of resultDirs) {
  const resultsFile = path.join(dir, 'results.json');
  if (!fs.existsSync(resultsFile)) continue;

  const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
  const stream = dir.split('/')[1].replace('-daily', '');

  consolidated.by_value_stream[stream] = {
    passed: results.stats.expected,
    failed: results.stats.unexpected,
    skipped: results.stats.skipped,
  };

  consolidated.summary.total += results.stats.expected + results.stats.unexpected;
  consolidated.summary.passed += results.stats.expected;
  consolidated.summary.failed += results.stats.unexpected;
  consolidated.summary.skipped += results.stats.skipped;
}

console.log(JSON.stringify(consolidated, null, 2));
fs.writeFileSync('test-results/consolidated/summary.json', JSON.stringify(consolidated, null, 2));
```

### Slack Notification with Summary

**`scripts/send-slack-notification.js`**:

```javascript
const fs = require('fs');
const https = require('https');

const summary = JSON.parse(fs.readFileSync('test-results/consolidated/summary.json', 'utf8'));

const color = summary.summary.failed === 0 ? 'good' : 'danger';
const status = summary.summary.failed === 0 ? '✅ PASSED' : '❌ FAILED';

const slackMessage = {
  attachments: [
    {
      color: color,
      title: `Nightly Regression Test Run - ${status}`,
      fields: [
        {
          title: 'Total Tests',
          value: summary.summary.total,
          short: true,
        },
        {
          title: 'Passed',
          value: summary.summary.passed,
          short: true,
        },
        {
          title: 'Failed',
          value: summary.summary.failed,
          short: true,
        },
        {
          title: 'HR Tests',
          value: `${summary.by_value_stream.hr.passed}/${summary.by_value_stream.hr.passed + summary.by_value_stream.hr.failed}`,
          short: true,
        },
        {
          title: 'Finance Tests',
          value: `${summary.by_value_stream.finance.passed}/${summary.by_value_stream.finance.passed + summary.by_value_stream.finance.failed}`,
          short: true,
        },
        {
          title: 'Supply Chain Tests',
          value: `${summary.by_value_stream['supply-chain'].passed}/${summary.by_value_stream['supply-chain'].passed + summary.by_value_stream['supply-chain'].failed}`,
          short: true,
        },
      ],
    },
  ],
};

const slackWebhook = process.env.SLACK_WEBHOOK_URL;
if (!slackWebhook) {
  console.error('SLACK_WEBHOOK_URL not set');
  process.exit(1);
}

const data = JSON.stringify(slackMessage);
const req = https.request(new URL(slackWebhook), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': data.length },
});

req.write(data);
req.end();

console.log('Slack notification sent');
```

---

## 7. Scaling Guidelines & Best Practices

### Test Migration Path: Single Stream → Enterprise Scale

**Phase 1: Single Value Stream** (Weeks 1-4)
- HR tests organized in `/tests/hr/`
- CI pipeline runs HR tests only
- Nightly regression for HR

**Phase 2: Add Second Value Stream** (Weeks 5-8)
- Finance tests in `/tests/finance/`
- Refactor shared helpers (auth, navigation, extraction)
- Introduce test groups and tagging

**Phase 3: Add Third Value Stream + Shared Tests** (Weeks 9-12)
- Supply Chain tests in `/tests/supply-chain/`
- Create cross-stream test group
- Consolidate results across pipelines

**Phase 4: Mature State** (Weeks 13+)
- 200+ tests across value streams
- TDD/BDD workflows per stream
- Multi-environment execution
- Continuous monitoring and optimization

### Governance & Ownership

| Role | Responsibility |
|------|---|
| **Test Framework Owner** | Maintain core helpers, update framework, govern patterns |
| **Value Stream Lead** | Own test suite for their stream, prioritize coverage |
| **Test Automation Engineer** | Day-to-day test maintenance, CI/CD updates |
| **QA Manager** | Define test strategy, set execution schedules |

### Common Pitfalls & Mitigation

| Pitfall | Mitigation |
|---------|-----------|
| Tests become too specialized (low reuse) | Enforce shared helper usage, code review |
| Test groups grow too large (slow execution) | Split groups by risk/functionality |
| Tests not tagged consistently | Automated pre-commit checks + documentation |
| Flaky cross-stream tests fail all pipelines | Isolate stream tests, use dedicated baseline runs |
| Selector drift across D365 updates | Use label/text-based selectors, maintain URL glossary |

---

## 8. Example Implementation: Full Execution Scenario

### Scenario: Developer Commits Code to HR Payroll Module

**Flow:**
```
Developer commits → GitHub → ADO Pipeline Trigger
        ↓
   TEST_GROUP=ci-smoke (5 min)
        ↓
   Run: @critical @ci tags
        ↓
   HR payroll tests: 3 passed
   Finance tests: 2 passed (shared payment validation)
   Supply Chain tests: skipped (not @critical)
        ↓
   Results: ✅ PASSED
        ↓
   PR can merge → main branch
```

**Command:**
```bash
TEST_GROUP=ci-smoke \
  D365_URL=https://dev.axcloud.dynamics.com \
  npx playwright test
```

### Scenario: Nightly Regression (All Value Streams)

**Flow:**
```
Scheduled 10 PM → ADO Pipeline Trigger
        ↓
   Stage 1 (Parallel):
     - HR Daily (30 min): 50 tests
     - Finance Daily (30 min): 45 tests
     - Supply Chain Daily (45 min): 38 tests
        ↓
   All pass → Stage 2:
     - Shared tests (20 min): 15 tests
        ↓
   Results Consolidation:
     - Total: 148 tests
     - Passed: 148
     - Failed: 0
        ↓
   Slack Notification: ✅ Green
```

**Commands (parallel jobs):**
```bash
# Job 1: HR
TEST_GROUP=hr-daily npx playwright test

# Job 2: Finance
TEST_GROUP=finance-daily npx playwright test

# Job 3: Supply Chain
TEST_GROUP=supply-chain-daily npx playwright test
```

---

## 9. Monitoring & Metrics

### Test Health Dashboard

Create a dashboard in Azure DevOps or Grafana showing:

- **Execution Trends**: Test count, pass rate over time
- **Per-Value-Stream Metrics**: HR pass rate, Finance pass rate, etc.
- **Flakiness Index**: Tests with high failure variance
- **Execution Duration**: Identify slow tests
- **Test Coverage**: Lines of D365 functionality covered

### Key Metrics to Track

```json
{
  "execution_metrics": {
    "total_test_runs": 1250,
    "avg_duration_per_run": "2 hours 15 minutes",
    "pass_rate": "99.2%",
    "false_positive_rate": "0.8%"
  },
  "by_value_stream": {
    "hr": { "pass_rate": "99.5%", "test_count": 65 },
    "finance": { "pass_rate": "99.0%", "test_count": 58 },
    "supply_chain": { "pass_rate": "98.8%", "test_count": 42 },
    "shared": { "pass_rate": "99.8%", "test_count": 15 }
  },
  "pipeline_health": {
    "ci_smoke": { "avg_duration": "8 min", "last_failure": "2 days ago" },
    "nightly_regression": { "avg_duration": "2 h 15 min", "last_failure": "never" },
    "pre_upgrade": { "last_run": "30 days ago", "status": "ready" }
  }
}
```

---

## 10. Summary: Enterprise Scaling Checklist

- [ ] **Repository Structure**: Organize tests by value stream + shared
- [ ] **Tagging Strategy**: Implement @value-stream, @risk-level, @context tags
- [ ] **Test Grouping**: Define test groups (ci-smoke, nightly, upgrade, etc.)
- [ ] **Pipeline Templates**: Create reusable YAML templates for each scenario
- [ ] **Helper Libraries**: Refactor helpers by domain (hr, finance, supply-chain)
- [ ] **Environment Matrix**: Define URLs, legal entities, test flags
- [ ] **Configuration Files**: test-groups.json, test-matrix.json, test-tags.json
- [ ] **Results Consolidation**: Scripts to merge results from parallel jobs
- [ ] **Notifications**: Slack/Teams integration for test results
- [ ] **Dashboarding**: Metrics and trends visualization
- [ ] **Governance**: Define roles, ownership, code review standards
- [ ] **Documentation**: Test maintenance guide, on-boarding, troubleshooting

---

**This architecture enables infinite scalability while keeping test maintenance tractable, costs manageable, and insights clear.**
