/**
 * Genera i temi divini — un accento per ciascuno dei 14 Dèi Olimpi,
 * in versione chiara e scura.   node scripts/build-deity-themes.mjs
 *
 * I colori NON sono scelti a occhio: per ogni tinta lo script cerca la
 * luminosità minima che soddisfa il contrasto richiesto sul fondo in uso.
 * Se una tinta non riesce a raggiungere la soglia, lo script fallisce.
 *
 * Le tinte derivano dai simboli attestati di ciascun dio (campo `sim` del
 * Grimorio): il tridente e il delfino di Poseidone, la vite e l'edera di
 * Dioniso, le spighe e il papavero di Demetra, l'incudine e il fuoco di Efesto.
 */
import { writeFileSync } from 'node:fs';

/* ------------------------------ colore ---------------------------------- */

const hslToRgb = (h, s, l) => {
  h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] :
    h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [r + m, g + m, b + m].map((v) => Math.round(v * 255));
};

const hex = (h, s, l) =>
  '#' + hslToRgb(h, s, l).map((v) => v.toString(16).padStart(2, '0')).join('');

const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (hx) => {
  const n = parseInt(hx.slice(1), 16);
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
};
const contrast = (a, b) => {
  const x = lum(a), y = lum(b);
  const [hi, lo] = x > y ? [x, y] : [y, x];
  return (hi + 0.05) / (lo + 0.05);
};

/**
 * Cerca la luminosità che raggiunge il contrasto richiesto contro `bg`,
 * partendo da `from` e muovendosi di 1 in 1 nella direzione indicata.
 */
function findL(h, s, bg, target, from, dir) {
  for (let l = from; l >= 0 && l <= 100; l += dir) {
    const c = hex(h, s, l);
    if (contrast(c, bg) >= target) return { hex: c, l, ratio: contrast(c, bg) };
  }
  throw new Error(`nessuna luminosità raggiunge ${target}:1 per h=${h} s=${s}`);
}

/* ------------------------- tinte per divinità ---------------------------- */
/* [tinta, saturazione] — primaria · secondaria (etichette) · terziaria (riti) */

const DEI = {
  estia:     { label: 'Estia · focolare e fiamma',        p: [28, 62], s: [12, 48], t: [42, 38] },
  zeus:      { label: 'Zeus · cielo e fulmine',           p: [214, 52], s: [44, 55], t: [96, 30] },
  era:       { label: 'Era · pavone e melograno',         p: [183, 44], s: [349, 46], t: [46, 42] },
  poseidone: { label: 'Poseidone · mare e tridente',      p: [204, 56], s: [178, 44], t: [162, 34] },
  ade:       { label: 'Ade · invisibilità e cipresso',    p: [276, 32], s: [42, 46], t: [152, 22] },
  apollo:    { label: 'Apollo · sole e alloro',           p: [45, 68], s: [205, 48], t: [88, 34] },
  artemide:  { label: 'Artemide · luna e cerva',          p: [216, 26], s: [142, 30], t: [30, 30] },
  dioniso:   { label: 'Dioniso · vite ed edera',          p: [286, 38], s: [344, 44], t: [120, 26] },
  ermes:     { label: 'Ermes · caduceo e strade',         p: [196, 26], s: [38, 52], t: [166, 24] },
  demetra:   { label: 'Demetra · spighe e papavero',      p: [40, 62], s: [8, 56], t: [94, 34] },
  atena:     { label: 'Atena · civetta e olivo',          p: [214, 24], s: [80, 34], t: [196, 26] },
  ares:      { label: 'Ares · lancia e ferro',            p: [2, 52], s: [220, 14], t: [18, 34] },
  afrodite:  { label: 'Afrodite · rosa e mirto',          p: [340, 46], s: [166, 32], t: [22, 40] },
  efesto:    { label: 'Efesto · incudine e fuoco',        p: [20, 60], s: [214, 18], t: [36, 46] },
};

/* ------------------------------ requisiti -------------------------------- */

const MODI = {
  light: { bg: '#f5eede', testoPulsante: '#fffdf7', from: 62, dir: -1 },
  dark:  { bg: '#221c14', testoPulsante: '#231d15', from: 38, dir: +1 },
};

const TESTO = 4.5;   // testo normale
const DECORO = 3.0;  // elementi non testuali

const righe = [];
let css = `/* Temi divini — generato da scripts/build-deity-themes.mjs. Non modificare a mano.
   Un accento per ciascuno dei 14 Dèi Olimpi, in versione chiara e scura.
   Ogni colore è stato cercato fino a soddisfare il contrasto richiesto:
   testo ≥ ${TESTO}:1, decori ≥ ${DECORO}:1. */\n`;

for (const [id, d] of Object.entries(DEI)) {
  for (const [modo, m] of Object.entries(MODI)) {
    const [ph, ps] = d.p, [sh, ss] = d.s, [th, ts] = d.t;

    const inkP  = findL(ph, ps, m.bg, TESTO, m.from, m.dir);      // testo accento
    const decor = findL(ph, ps, m.bg, DECORO, m.from, m.dir);     // decori
    const label = findL(sh, ss, m.bg, TESTO, m.from, m.dir);      // etichette (--terra)
    const dot   = findL(th, ts, m.bg, DECORO, m.from, m.dir);     // pallini (--olive)

    // Gradiente del pulsante: entrambi gli estremi leggibili col testo del pulsante.
    const gA = findL(ph, ps, m.testoPulsante, TESTO, modo === 'light' ? 55 : 82, modo === 'light' ? -1 : +1);
    const gB = hex(ph, ps, modo === 'light' ? Math.max(0, gA.l - 10) : Math.min(100, gA.l - 12));

    // soft: bordi tenui, nessun requisito di contrasto
    const soft = hex(ph, Math.round(ps * 0.7), modo === 'light' ? 72 : 34);
    const glow = modo === 'light'
      ? `${hex(ph, Math.min(100, ps + 18), 78)}b3`
      : `${hex(ph, ps, 46)}2e`;

    const sel = modo === 'light'
      ? `:root[data-deity='${id}']`
      : `:root[data-deity='${id}'][data-theme='dark']`;

    css += `\n/* ${d.label} — ${modo === 'light' ? 'chiaro' : 'scuro'} */\n${sel} {\n`
      + `  --gold: ${decor.hex};\n`
      + `  --gold-ink: ${inkP.hex};\n`
      + `  --gold-soft: ${soft};\n`
      + `  --terra: ${label.hex};\n`
      + `  --olive: ${dot.hex};\n`
      + `  --grad-gold: linear-gradient(180deg, ${gA.hex}, ${gB});\n`
      + `  --chip-bg: ${decor.hex}22;\n`
      + `  --quote-bg: ${decor.hex}14;\n`
      + `  --glow: ${glow};\n`
      + `}\n`;

    righe.push({
      dio: id, modo,
      testo: +inkP.ratio.toFixed(2),
      decoro: +decor.ratio.toFixed(2),
      etichetta: +label.ratio.toFixed(2),
      pallino: +dot.ratio.toFixed(2),
      pulsanteChiaro: +contrast(gA.hex, m.testoPulsante).toFixed(2),
      pulsanteScuro: +contrast(gB, m.testoPulsante).toFixed(2),
    });
  }
}

writeFileSync('src/theme/deity-themes.css', css);

/* ------------------------------ controlli -------------------------------- */

const problemi = righe.filter((r) =>
  r.testo < TESTO || r.etichetta < TESTO || r.decoro < DECORO ||
  r.pallino < DECORO || r.pulsanteChiaro < TESTO || r.pulsanteScuro < TESTO);

const min = (k) => Math.min(...righe.map((r) => r[k]));
console.log(`${Object.keys(DEI).length} divinità × 2 modalità = ${righe.length} palette\n`);
console.log('contrasti minimi su tutte le palette:');
console.log(`  testo accento   ${min('testo')}:1   (soglia ${TESTO})`);
console.log(`  etichette       ${min('etichetta')}:1   (soglia ${TESTO})`);
console.log(`  testo pulsante  ${Math.min(min('pulsanteChiaro'), min('pulsanteScuro'))}:1   (soglia ${TESTO})`);
console.log(`  decori          ${min('decoro')}:1   (soglia ${DECORO})`);
console.log(`  pallini         ${min('pallino')}:1   (soglia ${DECORO})`);

if (problemi.length) {
  console.error(`\n${problemi.length} palette sotto soglia:`);
  problemi.forEach((p) => console.error('  ', JSON.stringify(p)));
  process.exit(1);
}
console.log('\nnessuna palette sotto soglia.');
