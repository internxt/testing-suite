require('dotenv').config();
const { _electron: electron } = require('playwright');

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

  console.log("⏳ Waiting for post-login window...");
  await new Promise(r => setTimeout(r, 5000));

  const allWindows = await app.windows();
  console.log(`🪟 Total windows after login: ${allWindows.length}`);

  let postLoginWindow;
  for (const w of allWindows) {
    try {
      const html = await w.content();
      if (html.includes(email)) {
        postLoginWindow = w;
        break;
      }
    } catch (err) {
      console.warn("⚠️ Skipped closed window during HTML check.");
    }
  }

  if (!postLoginWindow) {
    console.error(`❌ Login failed: could not find window with full email "${email}".`);
    process.exit(1);
  }

  console.log(`✅ Login successful: found full email "${email}" in the HTML.`);

  await new Promise(() => {});
})();
