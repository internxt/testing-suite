import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();


test('login with valid credentials', async ({ page }) => {
  console.log("Navigate to login page");
  await page.goto('https://drive.internxt.com/login', { timeout: 30000 });

  console.log("Fill valid credentials");
  await page.getByRole('textbox', { name: 'Email' }).fill(process.env.LOGIN_EMAIL!);
  await page.getByRole('textbox', { name: 'Password' }).fill(process.env.LOGIN_PASSWORD!);

  console.log("Click login button");
  await page.getByRole('button', { name: 'Log in' }).click();

  console.log("'Upload files' button is visible");
  await expect(page.locator('[data-cy="topBarUploadFilesButton"]')).toBeVisible({ timeout: 50000 });
});
