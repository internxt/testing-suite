# testing-suite
End-to-end test automation for Internxt Drive (web + desktop apps)

This repository contains end-to-end automation tests for Internxt Drive across platforms (Web, Windows, macOS, Linux) using Pytest and Playwright.

📦 Project Setup
1. Clone the Repository

git clone git@github.com:internxt/testing-suite.git
cd testing-suite

🐍 Python (Desktop App Testing)
2. Create and Activate a Virtual Environment
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux
venv\Scripts\activate    # On Windows

3. Install Dependencies
pip install -r requirements.txt
playwright install --with-deps
pip install Appium-Python-Client


🌐 JavaScript / TypeScript (Web Testing)
4. Install Node Modules with Yarn
yarn install

5. Install Playwright Browsers
yarn playwright install


6. Set Up Python Virtual Environment (to write desktop app tests)

python3 -m venv venv
source venv/bin/activate

7. To deactivate later (to write web tests)

deactivate

✅ Activate venv when writing or running Python tests. ❌ Deactivate venv (or use another terminal tab) when working on JS tests.


🚀 Running Tests (JS/TS)

✅ Run All Tests

yarn playwright test

👀 Run Test in Debug Mode 

yarn playwright test --debug

This will open a Playwright inspector where you can pause, step through code, and resume test execution.

▶️ Run Python Tests

pytest tests/desktop/macos
pytest tests/desktop/windows
pytest tests/desktop/linux

🍏 macOS Desktop App Automation with Appium
Requirements:

1. Appium installed globally:

npm install -g appium

2. Appium server must be running:

appium

3. Xcode must be installed (required by Mac2 driver)

4. System Permissions: Grant Appium, Terminal, and Xcode access under:
System Settings > Privacy & Security > Accessibility

▶️ Run macOS App Test:
1. Make sure your virtual environment is activated

source venv/bin/activate

 2. Start Appium server
In a separate terminal tab, run:

appium

3. Run your macOS test
From the main terminal tab, execute:

pytest tests/desktop/macos/...


🧭 Test Structure
Tests are located in the 'tests' folder.

📁 Folder Structure

testing-suite/
├── tests/
│   └── web/
│       └── login.spec.ts
│   └── desktop/
│       └──macos
│       └──windows
│       └──linux
├── venv
├── package.json
└── README.md




