# tests/desktop/macos/test_browser_login.py
import time
import pytest
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

def test_browser_shows_login_fields(browser_driver):
    # give Chrome a second to open the new tab
    time.sleep(2)

    # find the handle whose URL contains our login path
    login_url_fragment = "drive.internxt.com/login"
    matching_handle = None
    for handle in browser_driver.window_handles:
        browser_driver.switch_to.window(handle)
        if login_url_fragment in browser_driver.current_url:
            matching_handle = handle
            break

    assert matching_handle, (
        f"❌ Could not find any open tab with URL containing '{login_url_fragment}'. "
        f"Open tabs:\n" + "\n".join(
            f" - {h}: {browser_driver.switch_to.window(h) or browser_driver.current_url}"
            for h in browser_driver.window_handles
        )
    )

    # now we're on the correct tab, wait for your data-cy inputs:
    wait = WebDriverWait(browser_driver, 15)
    email = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-cy=emailInput]")))
    password = browser_driver.find_element(By.CSS_SELECTOR, "[data-cy=passwordInput]")

    assert email.is_displayed(), "Email input not visible"
    assert password.is_displayed(), "Password input not visible"