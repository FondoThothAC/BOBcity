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
    console.log('PAGE ERROR:', error.message, '\n', error.stack);
  });

  try {
    await page.goto('http://localhost:3340', { waitUntil: 'load', timeout: 20000 });
    
    // Attempt to login if lobby
    try {
      const codeInput = page.locator('input[type="text"]');
      if (await codeInput.count() > 0) {
        await codeInput.fill('FondoThoth'); // just type something
        const btn = page.locator('button:has-text("Acceder a mi Comando Central")');
        if (await btn.count() > 0) {
          await btn.click();
          await page.waitForTimeout(2000);
        }
      }
    } catch(e) { }

    const tabsToClick = ['Macro Simulador', 'Anubis', 'Sandbox ABM'];
    for (const tabName of tabsToClick) {
      console.log('Clicking tab:', tabName);
      const tab = page.locator(`button:has-text("${tabName}")`);
      if (await tab.count() > 0) {
        await tab.first().click();
        await page.waitForTimeout(2000);
      } else {
        console.log('Tab not found:', tabName);
      }
    }
  } catch(e) {
    console.log('Navigation or clicking error:', e.message);
  }

  await browser.close();
  process.exit(0);
})();
