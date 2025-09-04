require('dotenv').config();
const { _electron: electron } = require('playwright');

const EXECUTABLE_PATH = 'C:\\Users\\tinab\\AppData\\Local\\Programs\\internxt-drive\\Internxt.exe';


async function launchApp() {
  const app = await electron.launch({ executablePath: EXECUTABLE_PATH });
  const window = await app.firstWindow();
  await window.waitForSelector('[data-automation-id="inputEmailLogin"]', { timeout: 15000 });
  return { app, window };
}

async function testEmptyFieldsLogin() {
  console.log("\n=== Negative Test: Empty email and password ===");

  const { app, window } = await launchApp();

  try {
    await window.fill('[data-automation-id="inputEmailLogin"]', '');
    await window.fill('[data-automation-id="inputPasswordLogin"]', '');
    await window.click('[data-automation-id="buttonLogin"]');

    await window.waitForTimeout(2000);

    const emailInvalid = await window.$eval('[data-automation-id="inputEmailLogin"]', el => !el.checkValidity());
    const passwordInvalid = await window.$eval('[data-automation-id="inputPasswordLogin"]', el => !el.checkValidity());

    if (!emailInvalid && !passwordInvalid) {
      console.error("❌ Expected required-field validation for empty inputs.");
    } else {
      console.log("✅ Validation correctly triggered for empty fields.");
    }
  } catch (err) {
    console.error("❌ Unexpected error:", err);
  } finally {
    await app.close();
  }
}

async function testEmptyEmailLogin() {
  console.log("\n=== Negative Test: Empty email with valid password ===");

  const { app, window } = await launchApp();

  try {
    await window.fill('[data-automation-id="inputEmailLogin"]', '');
    await window.fill('[data-automation-id="inputPasswordLogin"]', 'SomeSecurePassword123');
    await window.click('[data-automation-id="buttonLogin"]');

    await window.waitForTimeout(2000);

    const emailInvalid = await window.$eval('[data-automation-id="inputEmailLogin"]', el => !el.checkValidity());

    if (!emailInvalid) {
      console.error("❌ Expected email field to trigger required or invalid error.");
    } else {
      console.log("✅ Validation correctly triggered for empty email.");
    }
  } catch (err) {
    console.error("❌ Unexpected error:", err);
  } finally {
    await app.close();
  }
}

async function testEmptyPasswordLogin() {
  console.log("\n=== Negative Test: Valid email with empty password ===");

  const email = process.env.LOGIN_EMAIL || 'test@example.com';
  const { app, window } = await launchApp();

  try {
    await window.fill('[data-automation-id="inputEmailLogin"]', email);
    await window.fill('[data-automation-id="inputPasswordLogin"]', '');
    await window.click('[data-automation-id="buttonLogin"]');

    await window.waitForTimeout(2000);

    const passwordInvalid = await window.$eval('[data-automation-id="inputPasswordLogin"]', el => !el.checkValidity());

    if (!passwordInvalid) {
      console.error("❌ Expected password field to trigger required or invalid error.");
    } else {
      console.log("✅ Validation correctly triggered for empty password.");
    }
  } catch (err) {
    console.error("❌ Unexpected error:", err);
  } finally {
    await app.close();
  }
}

async function testWrongEmailLogin() {
  console.log("\n=== Negative Test: Wrong email with valid password ===");

  const password = process.env.LOGIN_PASSWORD || 'SomeSecurePassword123';
  const fakeEmail = `fake_user_${Date.now()}@example.com`;

  const { app, window } = await launchApp();

  try {
    await window.fill('[data-automation-id="inputEmailLogin"]', fakeEmail);
    await window.fill('[data-automation-id="inputPasswordLogin"]', password);
    await window.click('[data-automation-id="buttonLogin"]');

    await window.waitForTimeout(4000);

    const errorLocator = window.locator('text=Incorrect code, try again');
    const isVisible = await errorLocator.isVisible();

    if (isVisible) {
      console.log("✅ Server-side error displayed: 'Incorrect code, try again'");
    } else {
      console.error("❌ Expected error 'Incorrect code, try again' was not visible.");
    }
  } catch (err) {
    console.error("❌ Unexpected error:", err);
  } finally {
    await app.close();
  }
}

async function testWrongPasswordLogin() {
  console.log("\n=== Negative Test: Valid email with wrong password ===");

  const email = process.env.LOGIN_EMAIL;
  const wrongPassword = process.env.LOGIN_PASSWORD + '_wrong';

  if (!email || !wrongPassword) {
    console.error("❌ LOGIN_EMAIL or LOGIN_PASSWORD not set in .env");
    process.exit(1);
  }

  const { app, window } = await launchApp();

  try {
    await window.fill('[data-automation-id="inputEmailLogin"]', email);
    await window.fill('[data-automation-id="inputPasswordLogin"]', wrongPassword);
    await window.click('[data-automation-id="buttonLogin"]');

    await window.waitForTimeout(4000);

    const errorLocator = window.locator('text=Incorrect code, try again');
    const isVisible = await errorLocator.isVisible();

    if (isVisible) {
      console.log("✅ Server-side error displayed: 'Incorrect code, try again'");
    } else {
      console.error("❌ Expected error 'Incorrect code, try again' was not visible.");
    }
  } catch (err) {
    console.error("❌ Unexpected error:", err);
  } finally {
    await app.close();
  }
}

(async () => {
  await testEmptyFieldsLogin();
  await testEmptyEmailLogin();
  await testEmptyPasswordLogin();
  await testWrongEmailLogin();
  await testWrongPasswordLogin();
})();
