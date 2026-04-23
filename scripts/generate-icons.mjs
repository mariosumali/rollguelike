/**
 * Rasterize brand SVGs into every size the web/PWA/social world expects.
 *
 * Inputs (authored by hand):
 *   public/icon.svg            — square app/favicon mark (64x64 viewBox)
 *   public/icon-maskable.svg   — full-bleed, safe-zone padded for Android masking
 *   public/logo.svg            — horizontal wordmark lockup
 *
 * Outputs (generated):
 *   public/favicon-16.png, favicon-32.png, favicon-48.png
 *   public/favicon.ico                       (multi-size ICO: 16+32+48)
 *   public/apple-touch-icon.png              (180x180)
 *   public/icon-192.png, icon-512.png        (PWA any)
 *   public/icon-maskable-512.png             (PWA maskable)
 *   public/og-image.png                      (1200x630 social card — Facebook, Twitter, LinkedIn, Discord, Slack)
 *   public/share-square.png                  (1200x1200 square card — iMessage, WhatsApp, Signal, Instagram DM)
 *   public/logo.png                          (640x160 raster of wordmark)
 *
 * Run:
 *   npx playwright install chromium   (once)
 *   node scripts/generate-icons.mjs
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const pub = (name) => join(root, 'public', name);

const iconSvg = await readFile(pub('icon.svg'), 'utf8');
const maskableSvg = await readFile(pub('icon-maskable.svg'), 'utf8');
const logoSvg = await readFile(pub('logo.svg'), 'utf8');

const browser = await chromium.launch({ headless: true });

async function renderSvgAt(svg, size, out, { deviceScaleFactor = 1 } = {}) {
  const page = await browser.newPage({
    viewport: { width: size, height: size },
    deviceScaleFactor,
  });
  const html = `<!doctype html><html><head><style>
    html,body{margin:0;padding:0;background:transparent}
    svg{display:block;width:${size}px;height:${size}px;image-rendering:pixelated}
  </style></head><body>${svg}</body></html>`;
  await page.setContent(html, { waitUntil: 'load' });
  await page.screenshot({ path: out, omitBackground: false, type: 'png' });
  await page.close();
  console.log(`  wrote ${out.replace(root + '/', '')}`);
}

async function renderHtmlAt(html, width, height, out) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  await page.screenshot({ path: out, type: 'png', fullPage: false, clip: { x: 0, y: 0, width, height } });
  await page.close();
  console.log(`  wrote ${out.replace(root + '/', '')}`);
}

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');`;

// --- square icons --------------------------------------------------------
console.log('rendering square icons…');
await renderSvgAt(iconSvg, 16,  pub('favicon-16.png'));
await renderSvgAt(iconSvg, 32,  pub('favicon-32.png'));
await renderSvgAt(iconSvg, 48,  pub('favicon-48.png'));
await renderSvgAt(iconSvg, 180, pub('apple-touch-icon.png'));
await renderSvgAt(iconSvg, 192, pub('icon-192.png'));
await renderSvgAt(iconSvg, 512, pub('icon-512.png'));
await renderSvgAt(maskableSvg, 512, pub('icon-maskable-512.png'));

// --- wordmark logo raster -----------------------------------------------
console.log('rendering wordmark logo…');
{
  const w = 640, h = 160;
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  const html = `<!doctype html><html><head><style>
    html,body{margin:0;padding:0;background:transparent}
    svg{display:block;width:${w}px;height:${h}px}
  </style></head><body>${logoSvg}</body></html>`;
  await page.setContent(html, { waitUntil: 'load' });
  await page.screenshot({ path: pub('logo.png'), type: 'png', omitBackground: false });
  await page.close();
  console.log('  wrote public/logo.png (2x)');
}

// --- shared card styles -------------------------------------------------
// One CSS block reused across OG (landscape) and square share variants so
// edits stay in sync. The pixel font is @imported so Playwright fetches it
// before we screenshot (document.fonts.ready is awaited in renderHtmlAt).
const CARD_CSS = `
  ${FONT_IMPORT}
  :root { color-scheme: dark }
  html,body { margin:0; padding:0; background:#05050c; color:#f0ecd8; image-rendering: pixelated; }
  .card {
    position:relative; overflow:hidden; box-sizing:border-box;
    background:
      radial-gradient(1100px 500px at 30% 40%, rgba(255,216,107,0.10), transparent 60%),
      radial-gradient(900px 600px at 85% 90%, rgba(226,60,76,0.12), transparent 60%),
      linear-gradient(180deg, #0a0a18 0%, #05050c 100%);
    border: 8px solid #ffd86b;
    font-family: 'VT323', ui-monospace, 'Courier New', monospace;
  }
  .die { flex-shrink:0; filter: drop-shadow(0 8px 0 rgba(0,0,0,0.6)); }
  .die svg { width:100%; height:100%; display:block; }
  .kicker { color:#9fa7bd; text-transform:uppercase; font-family: 'VT323', monospace; }
  .title {
    font-family: 'Press Start 2P', ui-monospace, 'Courier New', monospace;
    font-weight:800; line-height:1; color:#f0ecd8;
    text-shadow: 6px 6px 0 #2c2f55;
  }
  .title .accent { color:#ffd86b; }
  .tag { color:#d6dde8; line-height:1.4; font-family: 'VT323', monospace; }
  .tag b { color:#ffd86b; font-weight:700; }
  .chips { display:flex; gap:14px; flex-wrap:wrap; }
  .chip {
    border:2px solid #2c2f55; color:#9fa7bd; background:#0a0a18;
    letter-spacing:2px; text-transform:uppercase;
    font-family: 'Press Start 2P', ui-monospace, monospace;
  }
  .chip.red { border-color:#8a1e1e; color:#ff6a7a; }
  .chip.gold { border-color:#8a5a00; color:#ffd86b; }
  .corner { position:absolute; width:24px; height:24px; background:#ffd86b; }
  .tl{top:0;left:0}.tr{top:0;right:0}.bl{bottom:0;left:0;background:#8a5a00}.br{bottom:0;right:0;background:#8a5a00}
`;

// --- OG / social card (1200x630) ----------------------------------------
// Landscape — used by Facebook, Twitter (summary_large_image), LinkedIn,
// Discord, Slack. 1.91:1 aspect ratio is the sweet spot.
console.log('rendering OG image…');
{
  const ogHtml = `<!doctype html>
<html><head><meta charset="utf-8"/><style>${CARD_CSS}
  .card.og {
    width:1200px; height:630px; padding:60px 72px;
    display:flex; align-items:center; gap:56px;
  }
  .og .die { width:340px; height:340px; }
  .og .copy { display:flex; flex-direction:column; gap:18px; min-width:0; }
  .og .kicker { font-size:22px; letter-spacing:8px; }
  .og .title { font-size:62px; letter-spacing:2px; }
  .og .tag { font-size:32px; letter-spacing:1px; max-width:680px; margin-top:8px; }
  .og .chips { margin-top:18px; }
  .og .chip { font-size:14px; padding:10px 14px; letter-spacing:2px; }
</style></head>
<body>
  <div class="card og">
    <span class="corner tl"></span><span class="corner tr"></span>
    <span class="corner bl"></span><span class="corner br"></span>
    <div class="die">${iconSvg}</div>
    <div class="copy">
      <div class="kicker">mobile roguelite · tap to roll</div>
      <div class="title">ROLL<span class="accent">guelike</span></div>
      <div class="tag">Tap the die. <b>Bend the odds.</b><br/>Survive the shrine.</div>
      <div class="chips">
        <span class="chip gold">endless waves</span>
        <span class="chip">6 heroes</span>
        <span class="chip red">free rerolls</span>
      </div>
    </div>
  </div>
</body></html>`;
  await renderHtmlAt(ogHtml, 1200, 630, pub('og-image.png'));
}

// --- square share card (1200x1200) --------------------------------------
// Square — preferred by iMessage link previews, WhatsApp, Signal, Telegram,
// Instagram DMs, and anywhere a 1:1 tile shows up. Vertical stack so the
// die reads big at thumbnail sizes.
console.log('rendering square share image…');
{
  const squareHtml = `<!doctype html>
<html><head><meta charset="utf-8"/><style>${CARD_CSS}
  .card.sq {
    width:1200px; height:1200px; padding:72px 80px;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    gap:36px; text-align:center;
  }
  .sq .die { width:480px; height:480px; margin-top:-10px; }
  .sq .kicker { font-size:26px; letter-spacing:10px; }
  .sq .title { font-size:86px; letter-spacing:2px; }
  .sq .tag { font-size:40px; letter-spacing:1px; max-width:1000px; }
  .sq .chips { justify-content:center; margin-top:8px; }
  .sq .chip { font-size:18px; padding:12px 18px; letter-spacing:2px; }
</style></head>
<body>
  <div class="card sq">
    <span class="corner tl"></span><span class="corner tr"></span>
    <span class="corner bl"></span><span class="corner br"></span>
    <div class="die">${iconSvg}</div>
    <div class="kicker">mobile roguelite · tap to roll</div>
    <div class="title">ROLL<span class="accent">guelike</span></div>
    <div class="tag">Tap the die. <b>Bend the odds.</b> Survive the shrine.</div>
    <div class="chips">
      <span class="chip gold">endless waves</span>
      <span class="chip">6 heroes</span>
      <span class="chip red">free rerolls</span>
    </div>
  </div>
</body></html>`;
  await renderHtmlAt(squareHtml, 1200, 1200, pub('share-square.png'));
}

await browser.close();

// --- favicon.ico (multi-size) -------------------------------------------
// Build a minimal ICO container by embedding 16/32/48 PNGs.
console.log('packing favicon.ico…');
async function buildIco(pngPaths) {
  const pngs = await Promise.all(
    pngPaths.map(async (p) => ({ path: p, buf: await readFile(p) })),
  );

  const headerSize = 6;
  const dirEntrySize = 16;
  const count = pngs.length;
  const offsetsStart = headerSize + dirEntrySize * count;

  const out = Buffer.alloc(offsetsStart + pngs.reduce((s, p) => s + p.buf.length, 0));
  // header: reserved=0, type=1 (icon), count
  out.writeUInt16LE(0, 0);
  out.writeUInt16LE(1, 2);
  out.writeUInt16LE(count, 4);

  let offset = offsetsStart;
  for (let i = 0; i < count; i++) {
    const { buf } = pngs[i];
    // infer width/height from PNG IHDR (bytes 16..23)
    const w = buf.readUInt32BE(16);
    const h = buf.readUInt32BE(20);
    const entryOffset = headerSize + dirEntrySize * i;

    out.writeUInt8(w >= 256 ? 0 : w, entryOffset + 0);       // width (0 = 256)
    out.writeUInt8(h >= 256 ? 0 : h, entryOffset + 1);       // height
    out.writeUInt8(0, entryOffset + 2);                       // colors in palette
    out.writeUInt8(0, entryOffset + 3);                       // reserved
    out.writeUInt16LE(1, entryOffset + 4);                    // color planes
    out.writeUInt16LE(32, entryOffset + 6);                   // bits per pixel
    out.writeUInt32LE(buf.length, entryOffset + 8);           // size of image data
    out.writeUInt32LE(offset, entryOffset + 12);              // offset of image data

    buf.copy(out, offset);
    offset += buf.length;
  }
  return out;
}

const ico = await buildIco([
  pub('favicon-16.png'),
  pub('favicon-32.png'),
  pub('favicon-48.png'),
]);
await writeFile(pub('favicon.ico'), ico);
console.log('  wrote public/favicon.ico');

console.log('\nall icons generated.');
