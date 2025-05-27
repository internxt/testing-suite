import os
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

from tests.conftest import APP_LOGIN_URL, RECOVERY_PATH

def _navigate_to_recovery_page(driver, wait):
    print(f"→ Navigate to login page: {APP_LOGIN_URL}")
    driver.get(APP_LOGIN_URL)

    print("→ Click “Forgot your password?” link")
    forgot_password_link = wait.until(
        EC.element_to_be_clickable((By.LINK_TEXT, "Forgot your password?"))
    )
    forgot_password_link.click()

    print(f"→ Check the URL to contain {RECOVERY_PATH}")
    wait.until(EC.url_contains(RECOVERY_PATH))
    assert RECOVERY_PATH in driver.current_url, (
        f"Expected URL to include {RECOVERY_PATH}, got {driver.current_url}"
    )
    print("✅ Successfully navigated to recovery page.")


def test_account_recovery_flow_positive(browser_driver):
    driver = browser_driver
    wait = WebDriverWait(driver, 10)

    _navigate_to_recovery_page(driver, wait)

    print("→ Locate the recovery-email input by its placeholder")
    email_input = wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, 'input[placeholder="Email"]'))
    )

    registered = os.environ.get("LOGIN_EMAIL", "valentyna@internxt.com")
    print(f"→ Fill in email: {registered!r}")
    email_input.clear()
    email_input.send_keys(registered)

    print("→ Click “Continue”")
    driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]').click()

    print("→ Check for “Check your inbox” text")
    confirmation = wait.until(
        EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'Check your inbox')]"))
    )
    assert "Check your inbox" in confirmation.text, (
        f"Expected inbox message, got {confirmation.text!r}"
    )
    print("✅ Positive account-recovery flow completed.")


def test_account_recovery_empty_email_validation(browser_driver):
    driver = browser_driver
    wait = WebDriverWait(driver, 10)

    _navigate_to_recovery_page(driver, wait)

    print("→ Locate the recovery-email input")
    email_input = wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, 'input[placeholder="Email"]'))
    )
    email_input.clear()

    print("→ Click “Continue” without entering email")
    driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]').click()

    print("→ Read browser native validationMessage")
    validation_message = driver.execute_script(
        "return arguments[0].validationMessage;", email_input
    )
    is_valid = driver.execute_script(
        "return arguments[0].checkValidity();", email_input
    )

    assert not is_valid, "Email input should be invalid when empty"
    assert "please fill in this field" in validation_message.lower(), (
        f"Expected native message, got {validation_message!r}"
    )
    assert RECOVERY_PATH in driver.current_url, (
        f"URL changed unexpectedly; still should be {RECOVERY_PATH}"
    )
    print("✅ Empty-email negative flow passed.")


def test_account_recovery_incorrect_email_format(browser_driver):
    driver = browser_driver
    wait = WebDriverWait(driver, 10)

    _navigate_to_recovery_page(driver, wait)

    print("→ Locate the recovery-email input")
    email_input = wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, 'input[placeholder="Email"]'))
    )
    email_input.clear()
    email_input.send_keys("test")

    print("→ Click “Continue” with invalid format")
    driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]').click()

    print("→ Wait for inline error banner (“Invalid email address”)")
    err = wait.until(EC.visibility_of_element_located((
        By.CSS_SELECTOR, "span.font-base.w-56.text-sm.text-red"
    )))
    print(f"   ▸ error banner text: {err.text!r}")
    assert "Invalid email address" in err.text, (
        f"Expected ‘Invalid email address’, got {err.text!r}"
    )

    assert RECOVERY_PATH in driver.current_url, (
        "Should remain on recovery page after invalid-format submission"
    )
    print("✅ Incorrect-format negative flow passed.")