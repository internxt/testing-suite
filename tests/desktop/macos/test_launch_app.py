from appium import webdriver
from appium.options.common import AppiumOptions
import pytest
import os

def bring_app_to_front(app_name="Internxt Drive"):
    os.system(f'osascript -e \'tell application "{app_name}" to activate\'')

@pytest.fixture(scope="module")
def driver():
    options = AppiumOptions()
    options.set_capability("platformName", "mac")
    options.set_capability("automationName", "mac2")
    options.set_capability("app", "/Applications/Internxt Drive.app")

    driver = webdriver.Remote("http://localhost:4723", options=options)
    bring_app_to_front("Internxt Drive")
    yield driver
    driver.quit()

def test_launch_app(driver):
    assert driver is not None
