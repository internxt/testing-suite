const { _electron: electron } = require('playwright');
const { test, expect } = require('@playwright/test');

test('launch Internxt app', async () => {
  const app = await electron.launch({ args: ['.'] }); // adjust path if needed
  const window = await app.firstWindow();
  const title = await window.title();

  expect(title).toContain('Internxt');
  await app.close();
});
