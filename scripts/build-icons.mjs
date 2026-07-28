/**
 * Genera le icone PNG dalle sorgenti SVG.   node scripts/build-icons.mjs
 *
 * iOS ignora completamente le icone SVG del manifest e di apple-touch-icon:
 * senza questi PNG, "Aggiungi a Home" mette una miniatura della pagina al posto
 * dell'icona dell'app. Android userebbe gli SVG, ma tenere un solo formato per
 * tutti evita di doversi ricordare la differenza.
 */
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const MISURE = [
  { src: 'public/icons/icon.svg',          out: 'public/icons/icon-192.png',      size: 192 },
  { src: 'public/icons/icon.svg',          out: 'public/icons/icon-512.png',      size: 512 },
  { src: 'public/icons/icon-maskable.svg', out: 'public/icons/maskable-512.png',  size: 512 },
  // apple-touch-icon: iOS vuole 180×180 e non gestisce la trasparenza,
  // quindi il fondo va appiattito sul colore del marmo.
  { src: 'public/icons/icon.svg',          out: 'public/icons/apple-touch-icon.png', size: 180, flatten: '#f5eede' },
];

for (const m of MISURE) {
  let img = sharp(readFileSync(m.src), { density: 384 }).resize(m.size, m.size);
  if (m.flatten) img = img.flatten({ background: m.flatten });
  const info = await img.png({ compressionLevel: 9 }).toFile(m.out);
  console.log(`${m.out.padEnd(38)} ${m.size}×${m.size}  ${(info.size / 1024).toFixed(1)} kB`);
}

console.log('\nfatto.');
