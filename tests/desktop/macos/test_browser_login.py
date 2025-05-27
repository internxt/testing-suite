import os
import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from tests.conftest import APP_LOGIN_URL, AUTH_SUCCESS_PATH

@pytest.mark.flaky(reruns=1)
def test_web_login_fields_and_open_desktop_app(browser_driver):
    # FIXME: this forces navigation because we haven't yet figured out how
    # to resume testing in the existing Chrome instance opened by the app
    print(f"→ Navigating to login page ({APP_LOGIN_URL})")
    browser_driver.get(APP_LOGIN_URL)

    wait = WebDriverWait(browser_driver, 10)
    print("→ Find email & password inputs")
    email_input = wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, '[data-cy="emailInput"]'))
    )
    password_input = wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, '[data-cy="passwordInput"]'))
    )

    print("→ Enter credentials")
    email_input.send_keys(os.environ["LOGIN_EMAIL"])
    password_input.send_keys(os.environ["LOGIN_PASSWORD"])

    print("→ Click the login button")
    submit = browser_driver.find_element(By.CSS_SELECTOR, '[data-cy="loginButton"]')
    submit.click()
    time.sleep(2)  

    print(f"→ Waiting for URL to contain {AUTH_SUCCESS_PATH}")
    wait.until(EC.url_contains(AUTH_SUCCESS_PATH))
    assert AUTH_SUCCESS_PATH in browser_driver.current_url, (
        f"Expected auth-success URL, got {browser_driver.current_url}"
    )

    print("→ Verify user email on page")
    user_email = wait.until(EC.presence_of_element_located((
        By.CSS_SELECTOR,
        f'h3[title="{os.environ["LOGIN_EMAIL"]}"]'
    )))
    assert user_email.text == os.environ["LOGIN_EMAIL"]

    print("→ Click ‘Open the desktop app’")
    open_button = wait.until(EC.element_to_be_clickable((
        By.CSS_SELECTOR,
        'a[href^="internxt://login-success"]'
    )))
    open_button.click()
    time.sleep(2)  

    print(" Click ‘Open the desktop app’ ")
    # ——— NOTE: a browser protocol-handler popup just appeared hereю Need to investigate how to accept or suppress this dialog