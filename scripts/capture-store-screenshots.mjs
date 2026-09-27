// Screenshot App Store dall'app web reale con dati reali: iPhone 6,9" (1320x2868) o iPad 13" (2064x2752).
// Prerequisiti: `npm run server` (porta 3001) e `npm run dev` (porta 5173) avviati.
// Uso: node scripts/capture-store-screenshots.mjs [iphone|ipad] [lat] [lng]
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const device = process.argv[2] === 'ipad' ? 'ipad' : 'iphone';
const [lat = 45.4642, lng = 9.19] = process.argv.slice(3).map(Number);
const SIZES = {
  iphone: { viewport: { width: 440, height: 956 }, deviceScaleFactor: 3, suffix: '1320x2868' },
  ipad: { viewport: { width: 1032, height: 1376 }, deviceScaleFactor: 2, suffix: 'ipad-2064x2752' }
};
const size = SIZES[device];
const OUT = 'store-assets/screenshots';
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: size.viewport,
  deviceScaleFactor: size.deviceScaleFactor,
  isMobile: true,
  hasTouch: true,
  geolocation: { latitude: lat, longitude: lng },
  permissions: ['geolocation'],
  locale: 'it-IT'
});
const page = await context.newPage();
await page.goto('http://localhost:5173/');
// La barra "Pro" del browser non esiste nell'app nativa
await page.addStyleTag({ content: '.fixed.bottom-0 { display: none !important; }' });
await page.waitForSelector('h3', { timeout: 60000 });
await page.waitForTimeout(3000);

const shot = async (name) => {
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/${name}-${size.suffix}.png` });
  console.log('saved', name);
};

await shot('01-mappa');

await page.evaluate(() => document.querySelector('main section:nth-of-type(2)').scrollIntoView());
await shot('02-lista');

await page.locator('main section:nth-of-type(2) h3').first().click();
await shot('03-dettaglio');
await page.keyboard.press('Escape');
await page.locator('button:has(svg.lucide-x)').first().click();

await page.evaluate(() => window.scrollTo(0, 0));
await page.locator('header button:has(svg.lucide-trending-up)').first().click();
await shot('04-statistiche');
await page.locator('button:has(svg.lucide-x)').first().click();

await page.locator('header button:has(svg.lucide-navigation)').first().click();
await page.locator('button[type="submit"]').first().click();
await page.waitForTimeout(6000);
await shot('05-viaggio');

await browser.close();
