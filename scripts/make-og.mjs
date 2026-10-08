import sharp from 'sharp';
const W = 1200, H = 630;
const panel = await sharp('public/landing/panel-desktop.webp').resize({ width: 640 }).png().toBuffer();
const pm = await sharp(panel).metadata();
const mask = Buffer.from(`<svg width="${pm.width}" height="${pm.height}"><rect width="100%" height="100%" rx="14"/></svg>`);
const rounded = await sharp(panel).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
const bg = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0B1B3A"/><stop offset="1" stop-color="#0E3A8C"/></linearGradient></defs>
<rect width="100%" height="100%" fill="url(#g)"/>
<text x="64" y="120" font-family="Poppins,Arial,sans-serif" font-weight="800" font-size="36" fill="#FF6F3C">NETIA</text>
<text font-family="Poppins,Arial,sans-serif" font-weight="800" font-size="56" fill="#fff"><tspan x="64" y="230">Gestioná tu club</tspan><tspan x="64" y="300">sin planillas</tspan></text>
<text font-family="Inter,Arial,sans-serif" font-size="26" fill="#C9D6F2"><tspan x="64" y="370">Socios, cuotas y aptos médicos</tspan><tspan x="64" y="405">en un solo lugar.</tspan></text>
<rect x="64" y="460" width="300" height="56" rx="28" fill="#007BFF"/>
<text x="214" y="496" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-weight="600" font-size="24" fill="#fff">Probá la demo</text>
<text x="64" y="590" font-family="Inter,Arial,sans-serif" font-size="18" fill="#8FA3CC">Datos de ejemplo</text>
</svg>`);
await sharp(bg).composite([{ input: rounded, left: 520, top: Math.round((H - pm.height) / 2) }]).png().toFile('public/og-image.png');
await sharp('public/logo.png').resize(180, 180, { fit: 'contain', background: '#ffffff' }).flatten({ background: '#ffffff' }).png().toFile('public/apple-touch-icon.png');
