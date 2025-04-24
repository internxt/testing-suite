import { test, expect } from '@playwright/test';

test('login with valid credentials', async ({ page }) => {
  console.log("Navigating to login page...");
  await page.goto('https://drive.internxt.com/login', { timeout: 30000 });

  console.log("Filling email...");
  await page.getByRole('textbox', { name: 'Email' }).fill('valentyna@internxt.com');

  console.log("Filling password...");
  await page.getByRole('textbox', { name: 'Password' }).fill('Skylinegtr05!');

  console.log("Clicking login button...");
  await page.getByRole('button', { name: 'Log in' }).click();

  console.log("Upload files button is visible");
  await expect(page.locator('[data-cy="topBarUploadFilesButton"]')).toBeVisible({ timeout: 10000 });
});
