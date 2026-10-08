// Presupuestos de peso (gzip) leyendo dist/.vite/manifest.json. Falla si se excede alguno.
// Uso: npm run build && node scripts/check-budgets.mjs
import { readFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const DIST = 'dist';
const manifestPath = join(DIST, '.vite', 'manifest.json');
if (!existsSync(manifestPath)) {
  console.error('Falta dist/.vite/manifest.json: corré `npm run build` primero.');
  process.exit(2);
}
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const gz = new Map();
const size = (file) => {
  if (!gz.has(file)) gz.set(file, gzipSync(readFileSync(join(DIST, file))).length);
  return gz.get(file);
};

const byName = (re) => Object.entries(manifest).find(([k]) => re.test(k))?.[1];
const entry = Object.values(manifest).find((c) => c.isEntry);

/** Archivos JS cargados estáticamente por un chunk (él + sus imports, recursivo). */
const staticClosure = (chunk, seen = new Set()) => {
  const files = new Set();
  const walk = (c) => {
    if (!c || seen.has(c.file)) return;
    seen.add(c.file);
    files.add(c.file);
    (c.imports ?? []).forEach((k) => walk(manifest[k]));
  };
  walk(chunk);
  return files;
};
const sum = (files) => [...files].reduce((n, f) => n + size(f), 0);
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

const entryFiles = staticClosure(entry);

// Chunks compartidos: los que cargan 3 o más páginas (framer-motion, date-fns, etc.) se cachean
// entre rutas, así que no cuentan como peso "propio" de una pestaña.
const pageChunks = Object.entries(manifest).filter(([k, c]) => /^src\/pages\/.+\.tsx$/.test(k) && c.isDynamicEntry);
const usage = new Map();
for (const [, c] of pageChunks) for (const f of staticClosure(c)) usage.set(f, (usage.get(f) ?? 0) + 1);
const isShared = (f) => (usage.get(f) ?? 0) >= 3;

const page = (re) => {
  const c = byName(re);
  if (!c) return null;
  const own = staticClosure(c);
  return new Set([...own].filter((f) => !entryFiles.has(f) && (f === c.file || !isShared(f))));
};

const pages = {
  dashboard: page(/pages\/Dashboard\.tsx$/),
  chat: page(/pages\/Chat\.tsx$/),
  calendar: page(/pages\/Calendar\.tsx$/),
  training: page(/pages\/Training\.tsx$/),
};
// Para librerías prohibidas se mira la clausura completa (incluye chunks compartidos).
const fullClosure = (re) => { const c = byName(re); return c ? new Set([...entryFiles, ...staticClosure(c)]) : null; };
const fullPages = {
  dashboard: fullClosure(/pages\/Dashboard\.tsx$/),
  chat: fullClosure(/pages\/Chat\.tsx$/),
  calendar: fullClosure(/pages\/Calendar\.tsx$/),
  training: fullClosure(/pages\/Training\.tsx$/),
};
// Se busca una firma en el contenido del chunk (los nombres de archivo no delatan la librería).
const hasLib = (set, marker) => !!set && [...set].some((f) => readFileSync(join(DIST, f), 'utf8').includes(marker));

const rows = [];
const check = (label, value, limit, fmt = kb) => rows.push({ label, value: fmt(value), limit: fmt(limit), ok: value <= limit });

check('Carga inicial JS (entry + imports estáticos, gzip)', sum(entryFiles), 190 * 1024);
check('Entry propio index-*.js (gzip)', size(entry.file), 190 * 1024);
if (pages.dashboard) check('/dashboard propio (gzip)', sum(pages.dashboard), 35 * 1024);
if (pages.chat) check('/chat propio (gzip)', sum(pages.chat), 15 * 1024);

const noLib = (name, marker) => {
  const bad = Object.entries(fullPages).filter(([, set]) => hasLib(set, marker)).map(([n]) => n);
  rows.push({ label: `${name} fuera de las 4 pestañas`, value: bad.length ? `en ${bad.join(', ')}` : 'no', limit: 'no', ok: !bad.length });
};
noLib('three / @react-three', 'WebGLRenderer');
noLib('recharts', 'recharts-wrapper');

rows.push({ label: 'Imágenes de avatar PNG en el bundle', value: String(Object.values(manifest).filter((c) => /avatar.*\.png$/.test(c.src ?? '')).length), limit: '0', ok: !Object.values(manifest).some((c) => /avatar.*\.png$/.test(c.src ?? '')) });

const w = Math.max(...rows.map((r) => r.label.length));
console.log('\nPresupuestos de peso');
for (const r of rows) console.log(`${r.ok ? 'OK ' : 'XX '} ${r.label.padEnd(w)}  ${String(r.value).padStart(10)}  (límite ${r.limit})`);
if (rows.some((r) => !r.ok)) { console.error('\nSe excedió al menos un presupuesto.'); process.exit(1); }
console.log('\nTodos los presupuestos se cumplen.');
