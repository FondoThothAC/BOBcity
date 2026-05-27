import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message, error.stack);
  });

  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText);
  });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  
  // click the tabs one by one and wait
  const clickTab = async (text) => {
    try {
      console.log('Clicking tab:', text);
      const tab = page.locator(`button:has-text("${text}")`);
      if (await tab.count() > 0) {
        await tab.first().click();
        await page.waitForTimeout(1000);
      }
    } catch(e) {
      console.log('Error clicking', text, e.message);
    }
  };

  await clickTab('Macro Simulador');
  await clickTab('Anubis');
  await clickTab('Sandbox ABM');

  await browser.close();
})();
