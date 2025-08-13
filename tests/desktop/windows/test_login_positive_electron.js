require('dotenv').config();
const { _electron: electron, expect } = require('playwright');

(async () => {
  const email = process.env.LOGIN_EMAIL;
  const password = process.env.LOGIN_PASSWORD;

  if (!email || !password) {
    console.error("❌ LOGIN_EMAIL or LOGIN_PASSWORD not set in .env");
    process.exit(1);
  }

  const app = await electron.launch({
    executablePath: 'C:\\Users\\tinab\\AppData\\Local\\Programs\\internxt-drive\\Internxt.exe',
  });

  const window = await app.firstWindow();

  console.log("⌛ Waiting for login form...");
  await window.waitForSelector('input[type="email"]', { timeout: 15000 });

  await window.fill('input[type="email"]', email);
  await window.fill('input[type="password"]', password);
  await window.click('button:has-text("Log in")');

  console.log("🚪 Logged in, waiting for email to appear...");
//   await window.waitForSelector(`text=${email.split('@')[0]}`, { timeout: 10000 });

console.log("✅ Logged in. Keeping app open for observation.");
await new Promise(() => {});


  // If you eventually want to close it:
  // await app.close();
})();
