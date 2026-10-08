// Chequeo de "tics de UI generada por IA" (ver /sistema-de-diseno → Criterio visual).
// Recorre src/**/*.tsx y falla (exit 1) listando archivo:línea. Sin dependencias.
// Excepciones: comentario `ui-bans-ignore: <motivo>` en la misma línea o en la anterior,
// o `ui-bans-ignore-file: <motivo>` en las primeras 5 líneas del archivo.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'src';

const RULES = [
  { id: 'borde-acento', re: /border-[tlrb]-\[\d+px\]/, msg: 'Borde de acento con ancho arbitrario (JER-02, ESP-04)', skip: /border-[tlrb]-transparent/ },
  { id: 'borde-acento', re: /border-[tl]-(2|4|8)\b/, msg: 'Borde de acento de un solo lado (JER-02, ESP-04)', skip: /border-[tlrb]-transparent/ },
  { id: 'borde-acento', re: /border-[tlrb]-(tino|zahia|roma|primary|secondary|success|warning|danger|destructive|info)\b/, msg: 'Borde de acento de color (JER-02, ESP-04)' },
  { id: 'texto-arbitrario', re: /text-\[(9|10|11|13|15)px\]/, msg: 'Tamaño de texto arbitrario: usá la escala de Tailwind, mínimo text-xs (TIP-02)' },
  { id: 'espaciado-arbitrario', re: /\b(p|m|gap|px|py|pt|pb|pl|pr|mt|mb)-\[(13|18|22|26|30)px\]/, msg: 'Espaciado fuera de la escala 4/8 (ESP-01)' },
  { id: 'color-hardcodeado', re: /\[hsl\(\d/, msg: 'Color hardcodeado en className: usá un token (COL-03)' },
];

const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.tsx')) files.push(p);
  }
};
walk(ROOT);

const hits = [];
for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n');
  if (lines.slice(0, 5).some((l) => l.includes('ui-bans-ignore-file:'))) continue;
  lines.forEach((line, i) => {
    if (line.includes('ui-bans-ignore:') || lines[i - 1]?.includes('ui-bans-ignore:')) return;
    for (const r of RULES) {
      if (r.skip?.test(line)) continue;
      if (r.re.test(line)) hits.push(`${file}:${i + 1}  [${r.id}] ${r.msg}\n    ${line.trim().slice(0, 140)}`);
    }
  });
}

if (hits.length) {
  console.error(`\n${hits.length} infracción(es) de criterio visual:\n`);
  console.error(hits.join('\n'));
  console.error('\nSi es una excepción justificada: agregá `// ui-bans-ignore: <motivo>` en la línea.');
  process.exit(1);
}
console.log('lint:ui OK: sin tics de UI prohibidos.');
