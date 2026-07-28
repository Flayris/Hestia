/**
 * Temi divini completi — uno per ciascuno dei 14 Dèi Olimpi, chiaro e scuro.
 *   node scripts/build-deity-themes.mjs
 *
 * Il tema NON tocca solo gli accenti: ridefinisce l'intera tavolozza, sfondi,
 * card, testo, pulsanti, barre. Tutto discende dalla coppia
 * PRINCIPALE · ACCENTO di ogni dio.
 *
 * I colori dati sono l'IDENTITÀ del tema e vengono usati tali e quali dove non
 * devono reggere del testo (bagliore, decori, pallini). Dove invece ci va del
 * testo, lo script parte dalla stessa TINTA e cerca la luminosità che raggiunge
 * il contrasto richiesto: molti dei colori scelti, presi alla lettera, sarebbero
 * illeggibili (il turchese #57BCC9 su fondo chiaro dà 1.9:1).
 * Se una tinta non riesce a raggiungere la soglia, lo script fallisce.
 */
import { writeFileSync } from 'node:fs';

/* --------------------------- utilità di colore --------------------------- */

const hexToRgb = (h) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

function hexToHsl(hx) {
  const [r, g, b] = hexToRgb(hx).map((v) => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? ((g - b) / d + (g < b ? 6 : 0))
      : max === g ? (b - r) / d + 2
      : (r - g) / d + 4;
    h *= 60;
  }
  return [h, s * 100, l * 100];
}

const hslToRgb = (h, s, l) => {
  h = ((h % 360) + 360) % 360; s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
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

const rgba = (h, s, l, a) => `rgba(${hslToRgb(h, s, l).join(', ')}, ${a})`;

const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (hx) => { const [r, g, b] = hexToRgb(hx); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
const contrast = (a, b) => {
  const x = lum(a), y = lum(b);
  const [hi, lo] = x > y ? [x, y] : [y, x];
  return (hi + 0.05) / (lo + 0.05);
};

/** Cerca la luminosità che raggiunge il contrasto richiesto contro `bg`. */
function findL(h, s, bg, target, from, dir, etichetta) {
  for (let l = from; l >= 0 && l <= 100; l += dir) {
    const c = hex(h, s, l);
    if (contrast(c, bg) >= target) return { hex: c, ratio: contrast(c, bg) };
  }
  throw new Error(`${etichetta}: nessuna luminosità raggiunge ${target}:1 (h=${Math.round(h)} s=${Math.round(s)})`);
}

/* ------------------------ coppie per divinità ---------------------------- */
/* principale · accento.  Le prime otto sono quelle indicate da Gaia.        */

const DEI = {
  poseidone: { p: '#1E6E8C', a: '#57BCC9', nota: 'blu mare + turchese' },
  dioniso:   { p: '#6E1F3E', a: '#8455A0', nota: 'bordeaux + viola d’uva' },
  apollo:    { p: '#D79A28', a: '#6FB1E0', nota: 'oro solare + azzurro' },
  atena:     { p: '#5C7488', a: '#7C864F', nota: 'grigio-blu + oliva' },
  efesto:    { p: '#B34A22', a: '#4A4B51', nota: 'brace + ferro' },
  demetra:   { p: '#D6A63A', a: '#B23A2E', nota: 'oro grano + rosso papavero' },
  ares:      { p: '#8C2B2B', a: '#45464B', nota: 'rosso sangue + ferro' },
  ade:       { p: '#3A2A46', a: '#C9A227', nota: 'viola scuro + oro' },

  /* costruite con lo stesso criterio, dai simboli del Grimorio */
  estia:     { p: '#B4622F', a: '#E0A94E', nota: 'brace del focolare + fiamma' },
  zeus:      { p: '#2C4E7A', a: '#D8B33A', nota: 'cielo profondo + oro del fulmine' },
  era:       { p: '#1F6E6A', a: '#A32E4E', nota: 'verde pavone + melograno' },
  artemide:  { p: '#5A7391', a: '#6E8F76', nota: 'argento lunare + cipresso' },
  ermes:     { p: '#46707E', a: '#C9922F', nota: 'argento vivo + ocra d’araldo' },
  afrodite:  { p: '#A8436A', a: '#6BA89A', nota: 'rosa + mirto' },
};

/* ------------------------------ requisiti -------------------------------- */

const T_FORTE = 7.0;   // testo principale
const T_TESTO = 4.5;   // testo corrente e accenti testuali
const T_DEBOLE = 3.2;  // testo terziario, sempre grande
const T_DECORO = 3.0;  // elementi non testuali

const controlli = [];
let css = `/* Temi divini — generato da scripts/build-deity-themes.mjs. Non modificare a mano.
   Tavolozza COMPLETA per ciascuno dei 14 Dèi Olimpi, chiara e scura:
   sfondi, card, testo, pulsanti, barre. Tutto discende dalla coppia
   principale · accento del dio.
   Contrasti verificati: testo principale ≥ ${T_FORTE}:1, testo corrente
   ≥ ${T_TESTO}:1, testo terziario ≥ ${T_DEBOLE}:1, decori ≥ ${T_DECORO}:1. */\n`;

for (const [id, d] of Object.entries(DEI)) {
  const [hP, sP] = hexToHsl(d.p);
  const [hA, sA] = hexToHsl(d.a);

  for (const modo of ['light', 'dark']) {
    const chiaro = modo === 'light';

    /* --- superfici: la tinta del dio impregna anche i fondi --- */
    const sky      = chiaro ? hex(hP, sP * 0.38, 86) : hex(hP, sP * 0.42, 14);
    const marble1  = chiaro ? hex(hP, sP * 0.24, 96) : hex(hP, sP * 0.30, 11);
    const marble2  = chiaro ? hex(hP, sP * 0.30, 90) : hex(hP, sP * 0.34, 7);
    const cardSolid= chiaro ? hex(hP, sP * 0.20, 99) : hex(hP, sP * 0.26, 16);
    const card     = chiaro ? rgba(hP, sP * 0.30, 100, 0.62) : rgba(hP, sP * 0.28, 26, 0.55);
    const line     = chiaro ? rgba(hP, sP * 0.55, 32, 0.20) : rgba(hP, sP * 0.45, 78, 0.18);

    // Il fondo di riferimento per il contrasto è il marmo: card e sheet vi poggiano.
    const bg = marble1;
    const from = chiaro ? 60 : 40;
    const dir  = chiaro ? -1 : +1;

    /* --- testo --- */
    const ink  = findL(hP, sP * 0.42, bg, T_FORTE,  from, dir, `${id}/${modo} ink`);
    const ink2 = findL(hP, sP * 0.38, bg, T_TESTO,  from, dir, `${id}/${modo} ink2`);
    const dim  = findL(hP, sP * 0.32, bg, T_DEBOLE, from, dir, `${id}/${modo} dim`);

    /* --- accenti --- */
    const goldInk = findL(hP, sP, bg, T_TESTO,  from, dir, `${id}/${modo} gold-ink`);
    const gold    = findL(hP, sP, bg, T_DECORO, from, dir, `${id}/${modo} gold`);
    const terra   = findL(hA, sA, bg, T_TESTO,  from, dir, `${id}/${modo} terra`);
    const olive   = findL(hA, sA * 0.8, bg, T_DECORO, from, dir, `${id}/${modo} olive`);

    /* --- pulsante primario: testo chiarissimo di giorno, scurissimo di notte --- */
    const onGold = chiaro ? hex(hP, sP * 0.20, 99) : hex(hP, sP * 0.35, 10);
    const gA = findL(hP, sP, onGold, T_TESTO, chiaro ? 56 : 84, chiaro ? -1 : +1, `${id}/${modo} pulsante`);
    const gAl = hexToHsl(gA.hex)[2];
    const gB = hex(hP, sP, chiaro ? gAl - 11 : gAl - 13);

    const soft = chiaro ? hex(hP, sP * 0.62, 74) : hex(hP, sP * 0.55, 32);

    const sel = chiaro ? `:root[data-deity='${id}']` : `:root[data-deity='${id}'][data-theme='dark']`;

    css += `\n/* ${id} — ${d.nota} — ${chiaro ? 'chiaro' : 'scuro'} */\n${sel} {\n`
      + `  --sky: ${sky};\n  --marble1: ${marble1};\n  --marble2: ${marble2};\n`
      + `  --card: ${card};\n  --card-solid: ${cardSolid};\n  --line: ${line};\n`
      + `  --ink: ${ink.hex};\n  --ink2: ${ink2.hex};\n  --dim: ${dim.hex};\n`
      + `  --gold: ${gold.hex};\n  --gold-ink: ${goldInk.hex};\n  --gold-soft: ${soft};\n`
      + `  --terra: ${terra.hex};\n  --olive: ${olive.hex};\n`
      + `  --grad-gold: linear-gradient(180deg, ${gA.hex}, ${gB});\n`
      + `  --on-gold: ${onGold};\n  --ivory: ${onGold};\n`
      + `  --surface-soft: ${chiaro ? rgba(hP, sP * 0.30, 100, 0.72) : rgba(hP, sP * 0.30, 28, 0.6)};\n`
      + `  --tabbar-bg: ${chiaro ? rgba(hP, sP * 0.26, 97, 0.88) : rgba(hP, sP * 0.34, 9, 0.9)};\n`
      + `  --field-bg: ${chiaro ? rgba(hP, sP * 0.24, 100, 0.8) : rgba(hP, sP * 0.30, 18, 0.85)};\n`
      + `  --track: ${rgba(hP, sP * 0.5, chiaro ? 45 : 70, chiaro ? 0.22 : 0.22)};\n`
      + `  --grip: ${rgba(hP, sP * 0.5, chiaro ? 40 : 75, 0.3)};\n`
      + `  --chip-bg: ${rgba(hP, sP, chiaro ? 50 : 62, chiaro ? 0.14 : 0.18)};\n`
      + `  --quote-bg: ${rgba(hP, sP, chiaro ? 50 : 62, chiaro ? 0.08 : 0.1)};\n`
      + `  --backdrop: ${rgba(hP, sP * 0.5, chiaro ? 20 : 4, chiaro ? 0.32 : 0.6)};\n`
      + `  --moon-shadow: ${chiaro ? hex(hP, sP * 0.35, 62) : hex(hP, sP * 0.35, 26)};\n`
      + `  --glow: ${chiaro ? `${d.a}80` : `${d.a}2b`};\n`
      + `  --colonnade: ${rgba(hP, sP * 0.6, chiaro ? 35 : 80, 0.55)};\n`
      + `  --colonnade-2: ${rgba(hA, sA * 0.6, chiaro ? 28 : 86, 0.5)};\n`
      + `  --colonnade-op: ${chiaro ? 0.12 : 0.07};\n`
      + `}\n`;

    controlli.push({
      dio: id, modo,
      ink: +ink.ratio.toFixed(2), ink2: +ink2.ratio.toFixed(2), dim: +dim.ratio.toFixed(2),
      goldInk: +goldInk.ratio.toFixed(2), terra: +terra.ratio.toFixed(2),
      gold: +gold.ratio.toFixed(2), olive: +olive.ratio.toFixed(2),
      btnA: +contrast(gA.hex, onGold).toFixed(2), btnB: +contrast(gB, onGold).toFixed(2),
    });
  }
}

writeFileSync('src/theme/deity-themes.css', css);

/* ------------------------------ controlli -------------------------------- */

const soglie = { ink: T_FORTE, ink2: T_TESTO, dim: T_DEBOLE, goldInk: T_TESTO,
  terra: T_TESTO, gold: T_DECORO, olive: T_DECORO, btnA: T_TESTO, btnB: T_TESTO };

const sotto = [];
for (const r of controlli) {
  for (const [k, soglia] of Object.entries(soglie)) {
    if (r[k] < soglia) sotto.push(`${r.dio}/${r.modo} ${k} = ${r[k]} < ${soglia}`);
  }
}

const min = (k) => Math.min(...controlli.map((r) => r[k]));
console.log(`${Object.keys(DEI).length} divinità × 2 modalità = ${controlli.length} tavolozze complete\n`);
console.log('contrasto minimo su tutte le tavolozze:');
for (const [k, soglia] of Object.entries(soglie)) {
  console.log(`  ${k.padEnd(8)} ${String(min(k)).padStart(6)}:1   (soglia ${soglia})`);
}

if (sotto.length) {
  console.error(`\n${sotto.length} valori sotto soglia:`);
  sotto.slice(0, 30).forEach((s) => console.error('  ' + s));
  process.exit(1);
}
console.log('\nnessun valore sotto soglia.');
