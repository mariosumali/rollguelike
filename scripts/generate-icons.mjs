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
 *   public/og-image.png                      (1200x630 social card — single og:image for ALL platforms)
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

// --- OG / social card (1200x630) ----------------------------------------
// Single share image used across Twitter, Facebook, LinkedIn, Discord,
// Slack, iMessage, WhatsApp — everywhere. Designed so the central logo
// composition (die + wordmark) survives a wide range of crops:
//   - 1.91:1 feed cards (Twitter, FB, LinkedIn): show the full card
//   - ~4:3 and ~1:1 bubbles (iMessage, WhatsApp): safe-zone centered square
//     of 630×630 around the die still contains the brand mark cleanly
// No marketing chips, no tagline text that breaks at small sizes — just
// the logo lockup.
console.log('rendering OG image…');
{
  const ogHtml = `<!doctype html>
<html><head><meta charset="utf-8"/><style>
  ${FONT_IMPORT}
  :root { color-scheme: dark }
  html,body {
    margin:0; padding:0; background:#05050c; color:#f0ecd8;
    image-rendering: pixelated;
    font-family: 'VT323', ui-monospace, 'Courier New', monospace;
  }
  .card {
    position:relative; width:1200px; height:630px; overflow:hidden;
    box-sizing:border-box;
    background:
      radial-gradient(620px 620px at 50% 46%, rgba(255,216,107,0.14), transparent 65%),
      radial-gradient(900px 600px at 50% 120%, rgba(226,60,76,0.10), transparent 60%),
      linear-gradient(180deg, #0a0a18 0%, #05050c 100%);
    border: 8px solid #ffd86b;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    gap:24px;
  }
  /* Corner bolts echo the shrine-wall motif from the icon. */
  .corner { position:absolute; width:24px; height:24px; background:#ffd86b; }
  .tl{top:0;left:0}.tr{top:0;right:0}
  .bl{bottom:0;left:0;background:#8a5a00}
  .br{bottom:0;right:0;background:#8a5a00}
  .die {
    width:300px; height:300px;
    filter: drop-shadow(0 10px 0 rgba(0,0,0,0.55));
  }
  .die svg { width:100%; height:100%; display:block; }
  .wordmark {
    font-family: 'Press Start 2P', ui-monospace, 'Courier New', monospace;
    font-weight:800; font-size:86px; line-height:1; letter-spacing:3px;
    color:#f0ecd8;
    text-shadow: 6px 6px 0 #2c2f55;
  }
  .wordmark .accent { color:#ffd86b; }
  .tag {
    font-size:30px; letter-spacing:6px; text-transform:uppercase;
    color:#9fa7bd; margin-top:4px;
  }
</style></head>
<body>
  <div class="card">
    <span class="corner tl"></span><span class="corner tr"></span>
    <span class="corner bl"></span><span class="corner br"></span>
    <div class="die">${iconSvg}</div>
    <div class="wordmark">ROLL<span class="accent">guelike</span></div>
    <div class="tag">tap the die · survive the shrine</div>
  </div>
</body></html>`;
  await renderHtmlAt(ogHtml, 1200, 630, pub('og-image.png'));
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
