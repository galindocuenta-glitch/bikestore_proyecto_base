import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.locator('body').dblclick();
  await page.locator('body').click({
    clickCount: 3
  });
  await page.locator('body').click();
  await page.locator('body').click();
  await page.locator('body').click();
  await page.locator('body').click();
  await page.locator('body').click();
  await page.locator('body').click();
  await page.locator('body').click({
    button: 'right'
  });
  await page.locator('body').click();
  await page.locator('body').click();
  await page.locator('body').click();
  await page.locator('body').dblclick();
  await page.locator('body').click();
  await page.locator('body').click();
});