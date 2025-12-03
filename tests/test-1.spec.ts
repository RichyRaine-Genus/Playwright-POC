import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://gnsplc-dev-265c7dadef95e8c2b53devaos.axcloud.dynamics.com/?cmp=4415&mi=DefaultDashboard');
  await page.getByRole('button', { name: 'Expand the navigation pane' }).click();
  await page.getByRole('treeitem', { name: 'Modules' }).click();
  await page.getByRole('treeitem', { name: 'Human resources' }).click();
  await page.locator('[id="undefined#undefined#[\\"mainmenu\\",\\"HRM\\",\\"Workers\\",\\"WorkerActions\\"]"]').click();
  await page.getByText('All worker actions').click();
  await page.goto('https://gnsplc-dev-265c7dadef95e8c2b53devaos.axcloud.dynamics.com/?cmp=4415&mi=HcmWorkerActionListAll');
});