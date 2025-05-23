from appium.options.common import AppiumOptions

def get_mac_capabilities():
    options = AppiumOptions()
    options.set_capability("platformName", "mac")
    options.set_capability("automationName", "mac2")
    options.set_capability("appium:bundleId", "internxt.InternxtDesktop")
    return options
