/**
 * One-off Playwright capture for README screenshots.
 * Run: npm run dev (on 127.0.0.1:5173) then:
 *   npx playwright install chromium
 *   node scripts/capture-readme-screens.mjs
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const out = (name) => join(root, 'docs', 'screenshots', name);

const base = process.env.README_SHOT_URL ?? 'http://127.0.0.1:5173';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(base, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
await page.screenshot({ path: out('menu.png') });

const enter = page.getByRole('button', { name: /ENTER THE SHRINE|NEW RUN/ });
await enter.click();
await page.waitForTimeout(500);
await page.screenshot({ path: out('character-select.png') });

await page.getByRole('button', { name: 'ROLL' }).click();
await page.waitForTimeout(600);
const skipOnboarding = page.getByRole('button', { name: 'Skip' });
if (await skipOnboarding.isVisible().catch(() => false)) {
  await skipOnboarding.click();
  await page.waitForTimeout(500);
}
await page.screenshot({ path: out('gameplay.png') });

await browser.close();
console.log('Wrote docs/screenshots/{menu,character-select,gameplay}.png');
