
import os
import time
import pytest
from dotenv import load_dotenv

load_dotenv()

from webdriver_manager.chrome import ChromeDriverManager
from selenium import webdriver as selenium_webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options as ChromeOptions

from appium import webdriver as appium_webdriver
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from helpers.capabilities import get_mac_capabilities
from helpers.app_helpers import bring_app_to_front

APP_LOGIN_URL = "https://drive.internxt.com/login?universalLink=true"
WEB_LOGIN_URL = "https://drive.internxt.com/login"
AUTH_SUCCESS_PATH = "/auth-success"
RECOVERY_PATH = "/recovery-link"

# === slow‐mode support ========================================================
# How many seconds to pause between every action (click, send_keys, get)
SLOW_MODE = float(os.getenv("SLOW_MODE", "0"))

def slow():
    if SLOW_MODE > 0:
        time.sleep(SLOW_MODE)

# Automatically patch key WebDriver/WebElement methods to insert slow() calls
@pytest.fixture(autouse=True)
def _inject_slowdown(monkeypatch):
    from selenium.webdriver.remote.webelement import WebElement
    from selenium.webdriver.remote.webdriver import WebDriver

    # patch WebElement.click()
    orig_click = WebElement.click
    def click_and_pause(self, *args, **kwargs):
        slow()
        result = orig_click(self, *args, **kwargs)
        slow()
        return result
    monkeypatch.setattr(WebElement, "click", click_and_pause)

    # patch WebElement.send_keys()
    orig_send = WebElement.send_keys
    def send_keys_and_pause(self, *args, **kwargs):
        slow()
        result = orig_send(self, *args, **kwargs)
        slow()
        return result
    monkeypatch.setattr(WebElement, "send_keys", send_keys_and_pause)

    # patch WebDriver.get()
    orig_get = WebDriver.get
    def get_and_pause(self, url, *args, **kwargs):
        slow()
        result = orig_get(self, url, *args, **kwargs)
        slow()
        return result
    monkeypatch.setattr(WebDriver, "get", get_and_pause)

    yield

# === Native macOS Appium fixture ==============================================
@pytest.fixture(scope="session")
def driver():
    opts = get_mac_capabilities()
    mac = appium_webdriver.Remote("http://localhost:4723", options=opts)
    bring_app_to_front("Internxt Drive")
    WebDriverWait(mac, 20).until(
        EC.presence_of_element_located((AppiumBy.NAME, "Welcome to Internxt"))
    )
    yield mac

# === Stand-alone Selenium Chrome fixture =====================================
@pytest.fixture(scope="session")
def browser_driver():
    service = ChromeService(ChromeDriverManager().install())
    chrome_opts = ChromeOptions()
    driver = selenium_webdriver.Chrome(service=service, options=chrome_opts)
    yield driver