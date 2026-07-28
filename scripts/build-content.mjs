/**
 * Converte `_input/Hestia - Grimorio completo_1.md` nei JSON che l'app carica.
 * Rigenerabile in qualsiasi momento:  node scripts/build-content.mjs
 *
 * Il markdown resta la fonte autorevole: non modificare i JSON a mano.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const SRC = '_input/Hestia - Grimorio completo_1.md';
const OUT = 'src/data';

const CATS = {
  '1.1': 'olimpi', '1.2': 'ctonii', '1.3': 'marini', '1.4': 'titani',
  '1.5': 'primordiali', '1.6': 'rustici', '1.7': 'personificati', '1.8': 'eroi',
};
const CAT_BY_LABEL = {
  'Dèi Olimpi': 'olimpi', 'Dèi Ctonii': 'ctonii', 'Dèi Marini': 'marini',
  'Titani e Astri': 'titani', 'Primordiali': 'primordiali',
  'Nature e Campagne': 'rustici', 'Personificazioni': 'personificati', 'Eroi': 'eroi',
};

const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/^(le|i|gli) /, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const lines = readFileSync(SRC, 'utf8').split(/\r?\n/);

/** Spezza un blocco di righe in { intro, sections: {etichetta: [righe]} }. */
function parseBlock(body) {
  const sections = {};
  const intro = [];
  let current = null;
  for (const raw of body) {
    const line = raw.trim();
    const inline = line.match(/^\*\*(.+?):\*\*\s*(.*)$/);   // **Fonte:** url
    const label = line.match(/^\*\*(.+?)\*\*$/);            // **Domini**
    if (inline) { sections[inline[1]] = [inline[2]]; current = sections[inline[1]]; continue; }
    if (label) { current = sections[label[1]] = []; continue; }
    if (current) current.push(line);
    else if (line) intro.push(line);
  }
  return { intro: intro.join(' ').trim(), sections };
}

const text = (s) => (s ?? []).filter(Boolean).join(' ')
  .replace(/^>\s*/, '').replace(/\s+/g, ' ').trim();
const list = (s) => (s ?? []).filter((l) => l.startsWith('- ')).map((l) => l.slice(2).trim());
const find = (sections, re) => Object.entries(sections).find(([k]) => re.test(k))?.[1];

/** Divide il documento in blocchi `### titolo` dentro un intervallo di righe. */
function blocks(from, to) {
  const out = [];
  let cur = null;
  for (let i = from; i < to; i++) {
    const m = lines[i].match(/^### (.+)$/);
    if (m) { cur = { title: m[1].trim(), body: [], line: i }; out.push(cur); }
    else if (cur) cur.body.push(lines[i]);
    else if (/^## /.test(lines[i])) cur = null;
  }
  return out;
}

const lineOf = (re) => lines.findIndex((l) => re.test(l));
const P1 = lineOf(/^# PARTE 1/), P2 = lineOf(/^# PARTE 2/);
const P3 = lineOf(/^# PARTE 3/), P4 = lineOf(/^# PARTE 4/), P5 = lineOf(/^# PARTE 5/);

/* ------------------------------- 1. Dèi -------------------------------- */

const gods = [];
{
  let cat = null;
  let cur = null;
  for (let i = P1; i < P2; i++) {
    const c = lines[i].match(/^## (1\.\d)/);
    if (c) { cat = CATS[c[1]]; cur = null; continue; }
    const h = lines[i].match(/^### (.+?) — (.+)$/);
    if (h && cat) {
      cur = { n: h[1].trim(), gk: h[2].trim(), cat, body: [] };
      gods.push(cur);
      continue;
    }
    if (cur) cur.body.push(lines[i]);
  }
}

const deities = gods.map((g) => {
  const first = g.body.find((l) => l.trim());
  const ep = first?.match(/^\*(.+)\*$/)?.[1].trim() ?? '';
  const rest = g.body.slice(g.body.indexOf(first) + 1);
  const { intro, sections } = parseBlock(rest);

  const cats = [g.cat];
  const anche = text(sections['Anche in']);
  if (anche && CAT_BY_LABEL[anche] && !cats.includes(CAT_BY_LABEL[anche])) {
    cats.push(CAT_BY_LABEL[anche]);
  }

  return {
    id: slug(g.n), n: g.n, gk: g.gk, ep, cats, intro,
    dom: list(sections['Domini']),
    sim: list(sections['Simboli e attributi']),
    off: list(sections['Offerte']),
    allora: text(sections["Nell'antichità"]),
    adesso: text(find(sections, /^Come onorar/)),
    inno: text(sections['Invocazione']) || undefined,
    src: text(sections['Fonte']) || undefined,
  };
});

const byName = new Map(deities.map((d) => [d.n.toLowerCase(), d.id]));
const idOf = (name) => {
  const k = name.trim().toLowerCase();
  return byName.get(k) ?? byName.get(`le ${k}`) ?? byName.get(`i ${k}`) ?? slug(name);
};

/* ------------------------- 2. Riti · 4. Concetti ------------------------ */

function simple(from, to, withFormula) {
  return blocks(from, to).map((b) => {
    const [n, sub0] = b.title.split(' — ');
    const first = b.body.find((l) => l.trim());
    const sub = first?.match(/^\*(.+)\*$/)?.[1].trim() ?? '';
    const rest = b.body.slice(b.body.indexOf(first) + 1);
    const { sections } = parseBlock(rest);
    const out = {
      id: slug(n),
      n: n.trim(),
      sub: sub || (sub0 ?? '').trim(),
      cos: text(find(sections, /^Cos'è/)),
      allora: text(sections["Nell'antichità"]),
      adesso: text(sections['Oggi puoi']),
    };
    if (withFormula) {
      const f = text(find(sections, /^Formula/));
      if (f) out.inno = f;
    }
    return out;
  });
}

const rites = simple(P2, P3, true);
const concepts = simple(P4, P5, false);

/* ------------------------------ 3. Feste ------------------------------- */

const festivals = {};
{
  let month = null;
  let cur = null;
  for (let i = P3; i < P4; i++) {
    const m = lines[i].match(/^## (.+)$/);
    if (m) { month = m[1].trim(); festivals[month] = []; cur = null; continue; }
    const h = lines[i].match(/^### Giorno (\d+) — (.+)$/);
    if (h && month) {
      cur = { d: Number(h[1]), n: h[2].trim(), body: [] };
      festivals[month].push(cur);
      continue;
    }
    if (cur) cur.body.push(lines[i]);
  }
  for (const list_ of Object.values(festivals)) {
    for (const f of list_) {
      const first = f.body.find((l) => l.trim());
      const gods_ = first?.match(/^\*Dèi onorati:\s*(.+)\*$/)?.[1] ?? '';
      const rest = f.body.slice(f.body.indexOf(first) + 1);
      const { sections } = parseBlock(rest);
      f.gods = gods_ ? gods_.split(',').map(idOf) : [];
      f.cos = text(find(sections, /^Cos'è/));
      f.allora = text(sections["Nell'antichità"]);
      f.adesso = text(sections['Oggi puoi']);
      delete f.body;
    }
  }
}

/* ------------------------ 5. Giorni sacri mensili ---------------------- */

const monthlyDays = [];
for (let i = P5; i < lines.length; i++) {
  const m = lines[i].match(/^\*\*(?:Giorno (\d+)|Deîpnon \(ultimo giorno del mese\)) — (.+?)\*\*\s*$/);
  if (!m) continue;
  const note = (lines[i + 1] ?? '').trim();
  monthlyDays.push({
    day: m[1] ? Number(m[1]) : 'ultimo',
    gods: m[2].split(',').map(idOf),
    note,
  });
}

/* -------------------------------- output -------------------------------- */

mkdirSync(OUT, { recursive: true });
const write = (name, data) => {
  writeFileSync(`${OUT}/${name}`, JSON.stringify(data, null, 2) + '\n');
  const n = Array.isArray(data) ? data.length : Object.keys(data).length;
  console.log(`${name.padEnd(18)} ${n}`);
};

write('gods.json', deities);
write('rites.json', rites);
write('concepts.json', concepts);
write('festivals.json', festivals);
write('monthlyDays.json', monthlyDays);

/* ------------------------------ controlli ------------------------------ */

const problems = [];
const ids = new Set(deities.map((d) => d.id));

for (const d of deities) {
  for (const [k, v] of Object.entries({ intro: d.intro, allora: d.allora, adesso: d.adesso })) {
    if (!v) problems.push(`${d.id}: manca ${k}`);
  }
  for (const [k, v] of Object.entries({ dom: d.dom, sim: d.sim, off: d.off })) {
    if (!v.length) problems.push(`${d.id}: ${k} vuoto`);
  }
  if (!d.src) problems.push(`${d.id}: manca la fonte`);
}
for (const [month, fs] of Object.entries(festivals)) {
  for (const f of fs) {
    if (!f.allora || !f.adesso) problems.push(`${month} ${f.d} ${f.n}: testo mancante`);
    for (const g of f.gods) if (!ids.has(g)) problems.push(`${month} ${f.n}: dio sconosciuto "${g}"`);
  }
}
for (const d of monthlyDays) {
  for (const g of d.gods) if (!ids.has(g)) problems.push(`giorno ${d.day}: dio sconosciuto "${g}"`);
}
for (const r of [...rites, ...concepts]) {
  if (!r.allora || !r.adesso) problems.push(`${r.id}: testo mancante`);
}

const feste = Object.values(festivals).flat().length;
console.log(`\ndèi ${deities.length} · riti ${rites.length} · feste ${feste} · concetti ${concepts.length} · giorni sacri ${monthlyDays.length}`);
console.log(`con invocazione: ${deities.filter((d) => d.inno).length}`);

if (problems.length) {
  console.error(`\n${problems.length} problemi:`);
  problems.slice(0, 30).forEach((p) => console.error('  ' + p));
  process.exit(1);
}
console.log('\nnessun problema.');
