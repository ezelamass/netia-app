/**
 * Mide las 4 pestañas del jugador en la demo (modo presentación): bytes por tipo y tiempo hasta contenido.
 *   npm run build && npx vite preview --host 127.0.0.1 --port 4173
 *   node scripts/perf-check.mjs [baseUrl]
 * Imprime una tabla Markdown. Falla si /chat baja más de 120 KB de imágenes.
 * Variables: CHROME_PATH.
 */
import { chromium } from 'playwright-core';
import { gzipSync } from 'node:zlib';

const base = process.argv[2] ?? 'http://127.0.0.1:4173';
const executablePath = process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const ROUTES = ['/dashboard', '/chat', '/calendar', '/training'];
const IMG_LIMIT_CHAT = 120 * 1024;
const kb = (n) => `${(n / 1024).toFixed(0)} KB`;

const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
const rows = [];
let failed = false;

for (const route of ROUTES) {
  // Contexto nuevo por ruta = carga en frío (sin caché del navegador).
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(`${base}/demo/jugador?modo=presentacion`, { waitUntil: 'networkidle' });

  const bytes = { js: 0, img: 0, other: 0 };
  page.on('response', async (res) => {
    try {
      const type = res.request().resourceType();
      const body = await res.body();
      // El servidor de preview no comprime: se mide gzip para comparar con los presupuestos.
      if (type === 'script') bytes.js += gzipSync(body).length;
      else if (type === 'image') bytes.img += body.length;
      else bytes.other += body.length;
    } catch { /* respuesta cancelada */ }
  });

  await (await ctx.newCDPSession(page)).send('Network.setCacheDisabled', { cacheDisabled: true });
  const t0 = Date.now();
  await page.goto(`${base}${route}`, { waitUntil: 'load' });
  await page.waitForSelector('[data-page-ready]', { timeout: 10_000 }).catch(() => {});
  const ready = Date.now() - t0;
  await page.waitForLoadState('networkidle');
  rows.push({ route, ready, js: bytes.js, img: bytes.img });
  if (route === '/chat' && bytes.img > IMG_LIMIT_CHAT) failed = true;
  await ctx.close();
}

// Cambio de pestaña con la app ya cargada: lo que siente el chico al navegar.
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
await page.goto(`${base}/demo/jugador?modo=presentacion`, { waitUntil: 'networkidle' });
await page.goto(`${base}/dashboard`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500); // deja correr el prefetch de rutas
const nav = [];
for (const [label, route] of [['Calendario', '/calendar'], ['Entrenar', '/training'], ['Chat IA', '/chat'], ['Inicio', '/dashboard']]) {
  const t = Date.now();
  await page.getByRole('link', { name: label }).last().click();
  await page.waitForURL(`**${route}*`);
  await page.waitForSelector('[data-page-ready]', { timeout: 10_000 });
  nav.push({ label, ms: Date.now() - t });
}
await browser.close();

console.log('\n| Ruta (carga en frío) | Listo | JS (gzip) | Imágenes |');
console.log('|---|---|---|---|');
for (const r of rows) console.log(`| ${r.route} | ${r.ready} ms | ${kb(r.js)} | ${kb(r.img)} |`);
console.log('\n| Cambio de pestaña (app cargada) | Tiempo |');
console.log('|---|---|');
for (const n of nav) console.log(`| → ${n.label} | ${n.ms} ms |`);
if (failed) { console.error(`\nFALLA: /chat supera ${kb(IMG_LIMIT_CHAT)} de imágenes.`); process.exit(1); }
