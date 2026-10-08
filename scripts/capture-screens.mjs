/**
 * Captura pantallas de la demo (modo presentación) para la landing y los videos.
 *   npm run dev            # en otra terminal
 *   node scripts/capture-screens.mjs [baseUrl]
 * Genera public/landing/*.webp (desktop 1440x900 y mobile 390x844).
 * Variables: CHROME_PATH (ejecutable de Chromium), OUT_DIR.
 */
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const outDir = process.env.OUT_DIR ?? 'public/landing';
const executablePath = process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
fs.mkdirSync(outDir, { recursive: true });

const SHOTS = [
  { name: 'panel', route: '/club/dashboard' },
  { name: 'socios', route: '/club/members' },
  { name: 'cuotas', route: '/club/fees' },
  { name: 'aptos', route: '/club/medical' },
  { name: 'asistencia', route: '/club/attendance' },
  { name: 'comunicacion', route: '/club/communication' },
  { name: 'informes', route: '/club/reports' },
  { name: 'familia', route: '/parent/dashboard', slug: 'familia' },
];
const VIEWPORTS = [
  { key: 'desktop', width: 1440, height: 900 },
  { key: 'mobile', width: 390, height: 844 },
];

const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.key === 'mobile' ? 2 : 1 });
  const page = await ctx.newPage();
  for (const shot of SHOTS) {
    await page.goto(`${base}/demo/${shot.slug ?? 'club'}?modo=presentacion`, { waitUntil: 'networkidle' });
    await page.goto(`${base}${shot.route}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(700);
    const buf = await page.screenshot();
    const file = path.join(outDir, `${shot.name}-${vp.key}.webp`);
    await sharp(buf).webp({ quality: 82 }).toFile(file);
    console.log('✓', file);
  }
  await ctx.close();
}
await browser.close();
