import pytest
from appium import webdriver
from time import sleep

@pytest.fixture(scope="function")
def driver():
    driver = webdriver.Remote("http://localhost:4723", desired_caps)
    yield driver
    driver.quit()

def test_login_positive(driver):
    driver.find_element(by=AppiumBy.ACCESSIBILITY_ID, value="Log in with browser").click()

    email_field = driver.find_element(by="Log in with browser", value="emailInput")
    password_field = driver.find_element(by="accessibility id", value="passwordInput")
    login_button = driver.find_element(by="accessibility id", value="loginButton")

    email_field.send_keys("your_test_email@internxt.com")
    password_field.send_keys("yourSecurePassword123")
    login_button.click()

    sleep(3)  # Wait for navigation or confirmation

    # Add a real assertion here, for example:
    assert driver.find_element(by="accessibility id", value="homeScreen")