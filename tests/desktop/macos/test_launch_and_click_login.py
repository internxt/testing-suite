# tests/desktop/macos/test_launch_and_click_login.py
import os
import time
import pytest
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_launch_app_and_click_login(driver):
    """
    1) driver fixture has already launched the Internxt app and
       waited for the “Welcome to Internxt” text.
    2) Now find & click the 'loginWithBrowserButton' by its accessibility ID.
    """
    # wait (up to 15s) for the “Log in with browser” button to appear
    login_btn = WebDriverWait(driver, 15).until(
        EC.presence_of_element_located((AppiumBy.ACCESSIBILITY_ID, "loginWithBrowserButton"))
    )
    assert login_btn.is_displayed(), "❌ 'Log in with browser' button is not visible"
    login_btn.click()
    print("✅ Clicked the 'Log in with browser' button")

    # give the OS a moment to switch to your browser
    time.sleep(3)

    # Optionally: assert that the frontmost process is now a browser—
    # this requires osascript, but you can omit if not needed
    front = (
        os.popen(
            'osascript -e \'tell application "System Events" '
            'to get name of first process whose frontmost is true\''
        )
        .read()
        .strip()
    )
    assert front.lower() in ("google chrome", "chromium", "safari"), (
        f"❌ Expected a browser to be frontmost, but saw '{front}'"
    )
    print(f"✅ Browser is now frontmost: {front!r}")