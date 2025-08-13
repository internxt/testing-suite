const { _electron: electron } = require('playwright');

(async () => {
  const app = await electron.launch({
    executablePath: 'C:\\Users\\tinab\\AppData\\Local\\Programs\\internxt-drive\\Internxt.exe',
    args: []  // No args needed for packaged apps
  });

  const window = await app.firstWindow();
  const title = await window.title();

  console.log(`✅ App window title: ${title}`);

  await new Promise(resolve => setTimeout(resolve, 5000));

  await app.close();
})();
