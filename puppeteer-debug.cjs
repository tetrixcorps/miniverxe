const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Log console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Console error:', msg.text());
    }
  });

  // Log page errors
  page.on('pageerror', err => {
    console.error('Page error:', err);
  });

  // Go to your local site
  await page.goto('http://localhost:4325', { waitUntil: 'networkidle2' });

  // Take a screenshot
  await page.screenshot({ path: 'homepage.png' });

  console.log('Screenshot saved as homepage.png');
  await browser.close();
})();