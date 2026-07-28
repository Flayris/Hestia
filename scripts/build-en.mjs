/**
 * Costruisce i contenuti inglesi unendo le traduzioni di `scripts/en/*` alla
 * struttura italiana generata da build-content.mjs.
 *
 *   node scripts/build-en.mjs
 *
 * Le traduzioni contengono SOLO i campi testuali: id, categorie, nome greco e
 * fonte vengono ripresi dall'italiano, così non possono divergere.
 * Lo script fallisce se manca una voce o se una lista ha un numero di elementi
 * diverso dall'originale — cioè se una traduzione ha perso o aggiunto qualcosa.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const IT = 'src/data/it';
const EN = 'src/data/en';

const read = (p) => JSON.parse(readFileSync(p, 'utf8'));

const gods = read(`${IT}/gods.json`);
const festivals = read(`${IT}/festivals.json`);
const rites = read(`${IT}/rites.json`);
const concepts = read(`${IT}/concepts.json`);
const monthly = read(`${IT}/monthlyDays.json`);

const CATS = ['olimpi', 'ctonii', 'marini', 'titani', 'primordiali', 'rustici', 'personificati', 'eroi'];

const T = {};
for (const c of CATS) {
  const mod = await import(`./en/gods/${c}.mjs`);
  Object.assign(T, mod.default);
}
const other = (await import('./en/other.mjs')).default;

const problems = [];

/* --------------------------------- dèi --------------------------------- */

const godsEn = gods.map((d) => {
  const t = T[d.id];
  if (!t) { problems.push(`dèi: manca la traduzione di "${d.id}"`); return d; }

  for (const k of ['dom', 'sim', 'off']) {
    if (!Array.isArray(t[k])) { problems.push(`${d.id}: ${k} non è una lista`); continue; }
    if (t[k].length !== d[k].length) {
      problems.push(`${d.id}: ${k} ha ${t[k].length} voci invece di ${d[k].length}`);
    }
  }
  for (const k of ['n', 'ep', 'intro', 'allora', 'adesso']) {
    if (!t[k]) problems.push(`${d.id}: manca ${k}`);
  }
  if (d.inno && !t.inno) problems.push(`${d.id}: manca l'invocazione`);

  return {
    id: d.id, n: t.n, gk: d.gk, ep: t.ep, cats: d.cats,
    intro: t.intro, dom: t.dom, sim: t.sim, off: t.off,
    allora: t.allora, adesso: t.adesso,
    ...(d.inno ? { inno: t.inno } : {}),
    ...(d.src ? { src: d.src } : {}),
  };
});

/* -------------------------- feste, riti, concetti ----------------------- */

const festivalsEn = {};
for (const [month, list] of Object.entries(festivals)) {
  festivalsEn[month] = list.map((f) => {
    const key = `${month}:${f.d}`;
    const t = other.festivals[key];
    if (!t) { problems.push(`feste: manca "${key}" (${f.n})`); return f; }
    return { d: f.d, n: t.n ?? f.n, gods: f.gods, cos: t.cos, allora: t.allora, adesso: t.adesso };
  });
}

const mapSimple = (list, table, label) => list.map((r) => {
  const t = table[r.id];
  if (!t) { problems.push(`${label}: manca "${r.id}"`); return r; }
  return {
    id: r.id, n: t.n ?? r.n, sub: t.sub, cos: t.cos, allora: t.allora, adesso: t.adesso,
    ...(r.inno ? { inno: t.inno } : {}),
  };
});

const ritesEn = mapSimple(rites, other.rites, 'riti');
const conceptsEn = mapSimple(concepts, other.concepts, 'concetti');

const monthlyEn = monthly.map((m) => {
  const t = other.monthlyDays[String(m.day)];
  if (!t) { problems.push(`giorni sacri: manca "${m.day}"`); return m; }
  return { day: m.day, gods: m.gods, note: t };
});

/* -------------------------------- output -------------------------------- */

mkdirSync(EN, { recursive: true });
const write = (name, data) => {
  writeFileSync(`${EN}/${name}`, JSON.stringify(data, null, 2) + '\n');
  console.log(`${name.padEnd(18)} ${Array.isArray(data) ? data.length : Object.keys(data).length}`);
};

write('gods.json', godsEn);
write('rites.json', ritesEn);
write('concepts.json', conceptsEn);
write('festivals.json', festivalsEn);
write('monthlyDays.json', monthlyEn);

/* ---------------- controllo: niente italiano rimasto dentro -------------- */

const SPIE = /\b(degli|della|dello|delle|nell|che si|perché|così|gli dèi|offerta|giorno|casa|questo|quando|sempre)\b/i;
for (const d of godsEn) {
  for (const [k, v] of Object.entries({ intro: d.intro, allora: d.allora, adesso: d.adesso })) {
    if (typeof v === 'string' && SPIE.test(v)) problems.push(`${d.id}: ${k} sembra ancora in italiano`);
  }
}

console.log(`\ndèi ${godsEn.length} · feste ${Object.values(festivalsEn).flat().length} · riti ${ritesEn.length} · concetti ${conceptsEn.length} · giorni sacri ${monthlyEn.length}`);

if (problems.length) {
  console.error(`\n${problems.length} problemi:`);
  problems.slice(0, 40).forEach((p) => console.error('  ' + p));
  process.exit(1);
}
console.log('\nnessun problema.');
