const sharp = require('sharp');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'public');

const svg = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="96" fill="#C65B3C"/>
  <text x="256" y="330" font-family="Calibri, Segoe UI, Arial" font-size="260" font-weight="700" fill="#ffffff" text-anchor="middle">R</text>
</svg>`;

async function main() {
  const buf = Buffer.from(svg);
  await sharp(buf).resize(192, 192).png().toFile(path.join(OUT_DIR, 'pwa-192x192.png'));
  await sharp(buf).resize(512, 512).png().toFile(path.join(OUT_DIR, 'pwa-512x512.png'));
  await sharp(buf).resize(180, 180).png().toFile(path.join(OUT_DIR, 'apple-touch-icon.png'));
  console.log('PWA icons generated in', OUT_DIR);
}

main();
