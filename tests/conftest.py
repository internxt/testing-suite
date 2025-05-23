# tests/conftest.py
import os
import tempfile
import atexit
import subprocess
import time

import pytest

from selenium import webdriver as selenium_webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager

from appium import webdriver as appium_webdriver
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from helpers.capabilities import get_mac_capabilities
from helpers.app_helpers import bring_app_to_front

# ------ Native App Fixture ------
@pytest.fixture(scope="session")
def driver():
    """
    Launches the macOS app under test via Appium and waits for the initial screen.
    """
    options = get_mac_capabilities()
    mac_driver = appium_webdriver.Remote("http://localhost:4723", options=options)

    # Bring the app window to front so Appium can interact with it
    bring_app_to_front("Internxt Drive")

    # Wait until we see the "Welcome to Internxt" label
    WebDriverWait(mac_driver, 20).until(
        EC.presence_of_element_located((AppiumBy.NAME, "Welcome to Internxt"))
    )

    yield mac_driver

    # Tear down Appium session at end of session
    mac_driver.quit()


# ------ Browser Fixture ------
@pytest.fixture(scope="session")
def browser_driver():
    """
    Starts a fresh Chrome with remote-debugging enabled, then attaches Selenium to it.
    """
    # 1) create a temporary user-data directory
    user_data_dir = tempfile.mkdtemp(prefix="selenium_chrome_")
    # ensure we clean it up on process exit
    atexit.register(lambda: subprocess.call(["rm", "-rf", user_data_dir]))

    # 2) launch a new Chrome pointing at that profile & enable remote debugging
    chrome_exe = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    subprocess.Popen([
        chrome_exe,
        "--remote-debugging-port=9222",
        f"--user-data-dir={user_data_dir}",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-default-apps",
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # give Chrome a moment to start up
    time.sleep(3)

    # 3) attach Selenium WebDriver to that running instance
    chrome_opts = ChromeOptions()
    chrome_opts.add_experimental_option("debuggerAddress", "127.0.0.1:9222")

    service = ChromeService(ChromeDriverManager().install())
    web_driver = selenium_webdriver.Chrome(service=service, options=chrome_opts)

    yield web_driver

    # Tear down
    web_driver.quit()