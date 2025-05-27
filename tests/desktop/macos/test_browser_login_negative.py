import os
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from tests.conftest import APP_LOGIN_URL

# FIXME: this forces navigation because we haven't yet figured out how
# to resume testing in the existing Chrome instance opened by the app

@pytest.mark.parametrize("email,pwd,field_selector", [
    ("",        "",        '[data-cy="emailInput"]'),    # both empty → email first
    ("",        "abc123",  '[data-cy="emailInput"]'),    # only email empty
    ("me@x.com","",        '[data-cy="passwordInput"]'), # only password empty
])
def test_empty_required_field_shows_native_validation(browser_driver, email, pwd, field_selector):
    """
    Submitting with a missing required field should trigger
    the browser's native validationMessage on that input.
    """
    print(f"→ Open {APP_LOGIN_URL!r} (email={email!r}, pwd={pwd!r})")
    driver = browser_driver
    driver.get(APP_LOGIN_URL)

    print("→ Fill inputs")
    driver.find_element(By.CSS_SELECTOR, '[data-cy="emailInput"]').send_keys(email)
    driver.find_element(By.CSS_SELECTOR, '[data-cy="passwordInput"]').send_keys(pwd)

    print("→ Click login button")
    driver.find_element(By.CSS_SELECTOR, '[data-cy="loginButton"]').click()

    print(f"→ Grab native validationMessage from {field_selector}")
    field = driver.find_element(By.CSS_SELECTOR, field_selector)
    msg = field.get_attribute("validationMessage")
    print(f"   ▸ validationMessage: {msg!r}")
    assert msg, "Expected a native 'Please fill in this field' message"
    assert "please fill in" in msg.lower()


@pytest.mark.parametrize("email,pwd", [
    ("wrong+" + os.environ["LOGIN_EMAIL"], os.environ["LOGIN_PASSWORD"]),
    (os.environ["LOGIN_EMAIL"], "not-the-right-one"),
])
def test_invalid_credentials_shows_server_error(browser_driver, email, pwd):
    """
    Bad email + good password, and good email + bad password
    should both stay on /login and show “Wrong login credentials”.
    """
    print(f"→ Open {APP_LOGIN_URL} (email={email!r}, pwd={pwd!r})")
    driver = browser_driver
    driver.get(APP_LOGIN_URL)
    wait = WebDriverWait(driver, 5)

    print("→ Fill email & password fields")
    driver.find_element(By.CSS_SELECTOR, '[data-cy="emailInput"]').send_keys(email)
    driver.find_element(By.CSS_SELECTOR, '[data-cy="passwordInput"]').send_keys(pwd)

    print("→ Click login button")
    driver.find_element(By.CSS_SELECTOR, '[data-cy="loginButton"]').click()

    print("→ Wait for error massage")
    err = wait.until(EC.visibility_of_element_located((
        By.CSS_SELECTOR,
        "span.font-base.w-56.text-sm.text-red"
    )))
    print(f"   ▸ error banner text: {err.text!r}")
    assert "Wrong login credentials" in err.text

    print("→ Verify remainingn on /login")
    assert "/login" in driver.current_url