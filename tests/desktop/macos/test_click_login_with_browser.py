import time
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_click_login_with_browser_button(driver):
    # 1) Find and click the native “Log in with browser” button
    btn = WebDriverWait(driver, 15).until(
        EC.presence_of_element_located((AppiumBy.ACCESSIBILITY_ID, "loginWithBrowserButton"))
    )
    assert btn.is_displayed()
    btn.click()
    time.sleep(2)  # let macOS hand off to Chrome
