import time

from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_launch_and_click_login(driver):
    # click the native “Log in with browser” button
    btn = WebDriverWait(driver, 15).until(
        EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "loginWithBrowserButton"))
    )
    assert btn.is_displayed(), "native login button wasn’t visible"
    btn.click()
    
    time.sleep(2)
   
    print("✅ Native button clicked → browser should be visible")
