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

  await window.waitForSelector('[data-automation-id="inputEmailLogin"]', { timeout: 15000 });
  await window.fill('[data-automation-id="inputEmailLogin"]', email);
  await window.fill('[data-automation-id="inputPasswordLogin"]', password);
  await window.click('[data-automation-id="buttonLogin"]');

  console.log("⏳ Waiting for post-login window...");
  await new Promise(r => setTimeout(r, 5000));

  const allWindows = await app.windows();
  console.log(`🪟 Total windows after login: ${allWindows.length}`);

  let postLoginWindow;
  for (const w of allWindows) {
    try {
      const hasHeader = await w.locator('[data-automation-id="headerAccountSection"]').count();
      if (hasHeader > 0) {
        postLoginWindow = w;
        break;
      }
    } catch {}
  }

  if (!postLoginWindow) {
    console.error('❌ Login failed: could not find post-login window with headerAccountSection.');
    await app.close();
    return;
  }

  console.log('🔍 Checking for [data-automation-id="headerAccountSection"]...');
  try {
    const headerLocator = postLoginWindow.locator('[data-automation-id="headerAccountSection"]');
    await headerLocator.waitFor({ timeout: 5000 });
    const headerText = await headerLocator.innerText();
    const expectedUsername = email.split('@')[0];

    if (headerText.includes(expectedUsername)) {
      console.log(`✅ Found username "${expectedUsername}" in header text: "${headerText}"`);
    } else {
      console.error(
        `❌ Header found, but missing username. Expected to find "${expectedUsername}" in: "${headerText}"`
      );
    }
  } catch (e) {
    console.error('❌ Missing [data-automation-id="headerAccountSection"] or could not retrieve text:', e);
  }

  console.log("🔄 Attempting to log out...");
  try {
    await postLoginWindow.locator('button:has(svg)').first().click();
    await postLoginWindow.click('text=Log out');
    await postLoginWindow.waitForSelector('text=Log out from this device?', { timeout: 6000 });
    await postLoginWindow.click('button:has-text("Log out")');
    console.log("✅ Successfully logged out.");
  } catch (e) {
    console.error("❌ Failed to log out:", e);
  }

  // await app.close(); 
})();
