require('dotenv').config();
const { _electron: electron } = require('playwright');

const EXECUTABLE_PATH = 'C:\\Users\\tinab\\AppData\\Local\\Programs\\internxt-drive\\Internxt.exe';

async function testPositiveLogin() {
  const email = process.env.LOGIN_EMAIL;
  const password = process.env.LOGIN_PASSWORD;

  if (!email || !password) {
    console.error("❌ LOGIN_EMAIL or LOGIN_PASSWORD not set in .env");
    process.exit(1);
  }

  const app = await electron.launch({ executablePath: EXECUTABLE_PATH });
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


  for (const [i, w] of allWindows.entries()) {
    try {
      const title = await w.title();
      const url = await w.url();
      console.log(`🔍 Window[${i}] → title: "${title}", url: ${url}`);
    } catch (err) {
      console.warn(`⚠️ Window[${i}] is closed or inaccessible`);
    }
  }

  const html = await postLoginWindow.content();
  console.log("📄 postLoginWindow HTML snippet:\n", html.slice(0, 1000));

  await postLoginWindow.screenshot({ path: 'debug-post-login.png' });
  console.log("📸 Screenshot saved: debug-post-login.png");
  
console.log("🔄 Attempting to log out...");

try {
  // Step 1: Click the settings (gear) icon — uses button with SVG
  await postLoginWindow.locator('button:has(svg)').first().click();

  // Step 2: Click "Log out" from the dropdown
  await postLoginWindow.click('text=Log out');

  // Step 3: Wait for modal and confirm
  await postLoginWindow.waitForSelector('text=Log out from this device?', { timeout: 5000 });
  await postLoginWindow.click('button:has-text("Log out")');

  console.log("✅ Successfully logged out.");
} catch (e) {
  console.error("❌ Failed to log out:", e);
}

  // await app.close();

}

async function testEmptyFieldsLogin() {
  console.log("\n=== Negative Test: Empty email and password ===");

  const app = await electron.launch({ executablePath: EXECUTABLE_PATH });
  const window = await app.firstWindow();

  console.log("⌛ Waiting for login form...");
  await window.waitForSelector('input[type="email"]', { timeout: 15000 });

  await window.fill('input[type="email"]', '');
  await window.fill('input[type="password"]', '');
  await window.click('button:has-text("Log in")');

  await window.waitForTimeout(3000); // give the app time to react

  const emailInvalid = await window.$eval('input[type="email"]', el => !el.checkValidity());
  const passwordInvalid = await window.$eval('input[type="password"]', el => !el.checkValidity());

  if (!emailInvalid && !passwordInvalid) {
    console.error("❌ Expected required-field validation for empty email and password.");
  } else {
    console.log("✅ Validation correctly triggered for empty fields.");
  }

  await app.close();
}
async function testEmptyEmailLogin() {
  console.log("\n=== Negative Test: Empty email with valid password ===");

  const app = await electron.launch({ executablePath: EXECUTABLE_PATH });
  const window = await app.firstWindow();

  console.log("⌛ Waiting for login form...");
  await window.waitForSelector('input[type="email"]', { timeout: 15000 });

  // Leave email empty, but fill password
  await window.fill('input[type="email"]', '');
  await window.fill('input[type="password"]', 'SomeSecurePassword123'); // fake valid password

  await window.click('button:has-text("Log in")');

  await window.waitForTimeout(3000); // allow UI to react

  const emailInvalid = await window.$eval('input[type="email"]', el => !el.checkValidity());
  const passwordInvalid = await window.$eval('input[type="password"]', el => !el.checkValidity());

  if (!emailInvalid) {
    console.error("❌ Expected email field to trigger required or invalid error.");
  } else {
    console.log("✅ Validation correctly triggered for empty email.");
  }

  await app.close();
}
async function testEmptyPasswordLogin() {
  console.log("\n=== Negative Test: Valid email with empty password ===");

  const email = process.env.LOGIN_EMAIL || 'test@example.com'; // fallback dummy email

  const app = await electron.launch({ executablePath: EXECUTABLE_PATH });
  const window = await app.firstWindow();

  console.log("⌛ Waiting for login form...");
  await window.waitForSelector('input[type="email"]', { timeout: 15000 });

  // Fill valid email, leave password empty
  await window.fill('input[type="email"]', email);
  await window.fill('input[type="password"]', '');

  await window.click('button:has-text("Log in")');

  await window.waitForTimeout(3000); // wait for UI reaction

  const emailInvalid = await window.$eval('input[type="email"]', el => !el.checkValidity());
  const passwordInvalid = await window.$eval('input[type="password"]', el => !el.checkValidity());

  if (!passwordInvalid) {
    console.error("❌ Expected password field to trigger required or invalid error.");
  } else {
    console.log("✅ Validation correctly triggered for empty password.");
  }

  await app.close();
}
async function testWrongEmailLogin() {
  console.log("\n=== Negative Test: Wrong email with valid password ===");

  const password = process.env.LOGIN_PASSWORD || 'SomeSecurePassword123';
  const fakeEmail = `fake_user_${Date.now()}@example.com`;

  const app = await electron.launch({ executablePath: EXECUTABLE_PATH });
  const window = await app.firstWindow();

  console.log("⌛ Waiting for login form...");
  await window.waitForSelector('input[type="email"]', { timeout: 15000 });

  
  await window.fill('input[type="email"]', fakeEmail);


  await window.fill('input[type="password"]', password);
  await window.click('button:has-text("Log in")');

  await window.waitForTimeout(4000); // allow server time to respond

  // Look for visible error message with exact or partial text match
  const errorLocator = window.locator('text=Incorrect code, try again');
  const isVisible = await errorLocator.isVisible();

  if (isVisible) {
    console.log("✅ Server-side error displayed: 'Incorrect code, try again'");
  } else {
    console.error("❌ Expected error 'Incorrect code, try again' was not visible.");
  }

  await app.close();
}
async function testWrongPasswordLogin() {
  console.log("\n=== Negative Test: Valid email with wrong password ===");

  const email = process.env.LOGIN_EMAIL;
  const wrongPassword = process.env.LOGIN_PASSWORD + '_wrong';



  if (!email || !wrongPassword) {
    console.error("❌ LOGIN_EMAIL or LOGIN_PASSWORD not set in .env");
    process.exit(1);
  }

  const app = await electron.launch({ executablePath: EXECUTABLE_PATH });
  const window = await app.firstWindow();

  console.log("⌛ Waiting for login form...");
  await window.waitForSelector('input[type="email"]', { timeout: 15000 });

  await window.fill('input[type="email"]', email);
  await window.fill('input[type="password"]', wrongPassword);
  await window.click('button:has-text("Log in")');

  await window.waitForTimeout(4000); // give server time to respond

  const errorLocator = window.locator('text=Incorrect code, try again');
  const isVisible = await errorLocator.isVisible();

  if (isVisible) {
    console.log("✅ Server-side error displayed: 'Incorrect code, try again'");
  } else {
    console.error("❌ Expected error 'Incorrect code, try again' was not visible.");
  }

  await app.close();
}



(async () => {
  // Run only the negative test for now
  await testPositiveLogin();
  await testEmptyFieldsLogin();
  // If you want to run the positive test later:
  // await testPositiveLogin();
})();
