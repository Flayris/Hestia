import type { Category, CategoryKey, Deity, Festival, MonthlySacredDay, Rite, Concept } from '../types';
import type { Lang } from '../lang';

import godsIt from './it/gods.json';
import festivalsIt from './it/festivals.json';
import ritesIt from './it/rites.json';
import conceptsIt from './it/concepts.json';
import monthlyIt from './it/monthlyDays.json';

import godsEn from './en/gods.json';
import festivalsEn from './en/festivals.json';
import ritesEn from './en/rites.json';
import conceptsEn from './en/concepts.json';
import monthlyEn from './en/monthlyDays.json';

/**
 * Contenuti del Grimorio in due lingue.
 *
 * L'italiano è generato da `_input/Hestia - Grimorio completo_1.md` con
 * `node scripts/build-content.mjs`; l'inglese da `node scripts/build-en.mjs`,
 * che unisce le traduzioni di `scripts/en/*.mjs` alla struttura italiana.
 * Non modificare i JSON a mano.
 */

interface Bundle {
  DEITIES: Deity[];
  FESTIVALS: Record<string, Festival[]>;
  RITES: Rite[];
  CONCEPTS: Concept[];
  MONTHLY_DAYS: MonthlySacredDay[];
}

const BUNDLES: Record<Lang, Bundle> = {
  it: {
    DEITIES: godsIt as Deity[],
    FESTIVALS: festivalsIt as Record<string, Festival[]>,
    RITES: ritesIt as Rite[],
    CONCEPTS: conceptsIt as Concept[],
    MONTHLY_DAYS: monthlyIt as MonthlySacredDay[],
  },
  en: {
    DEITIES: godsEn as Deity[],
    FESTIVALS: festivalsEn as Record<string, Festival[]>,
    RITES: ritesEn as Rite[],
    CONCEPTS: conceptsEn as Concept[],
    MONTHLY_DAYS: monthlyEn as MonthlySacredDay[],
  },
};

/** Ordine dei mesi ellenici — SPEC.md §5.1. Non si traducono. */
export const MONTHS = [
  'Hekatombaiṓn', 'Metageitniṓn', 'Boēdromiṓn', 'Pyanepsiṓn',
  'Maimaktēriṓn', 'Poseideṓn', 'Gamēliṓn', 'Anthestēriṓn',
  'Elaphēboliṓn', 'Mounichiṓn', 'Thargēliṓn', 'Skirophoriṓn',
];

const CAT_KEYS: CategoryKey[] = [
  'olimpi', 'ctonii', 'marini', 'titani',
  'primordiali', 'rustici', 'personificati', 'eroi',
];
const CAT_SYM: Record<CategoryKey, string> = {
  olimpi: 'Ω', ctonii: 'Ψ', marini: '≈', titani: '☉',
  primordiali: '◍', rustici: '❦', personificati: '✦', eroi: 'Η',
};

/** Tutto ciò che serve a una schermata, nella lingua scelta. */
export function content(lang: Lang) {
  const b = BUNDLES[lang];

  const byId = (id: string) => b.DEITIES.find((d) => d.id === id);
  const nameOf = (id: string) => byId(id)?.n ?? id;
  const deitiesOf = (key: CategoryKey) => b.DEITIES.filter((d) => d.cats.includes(key));

  const categories: Category[] = CAT_KEYS.map((key) => ({
    key,
    label: '',                     // l'etichetta visibile viene da i18n (t.cat)
    desc: '',
    sym: CAT_SYM[key],
    count: deitiesOf(key).length,
  }));

  /** Il Poseideṓn deúteros usa le feste del Poseideṓn. */
  const festivalsOfMonth = (month: string): Festival[] =>
    b.FESTIVALS[month.replace(/ deúteros$/, '')] ?? [];

  const festivalOn = (month: string, day: number) =>
    festivalsOfMonth(month).find((f) => f.d === day);

  const sacredDay = (day: number, monthLength: number): MonthlySacredDay | undefined =>
    day === monthLength
      ? b.MONTHLY_DAYS.find((d) => d.day === 'ultimo')
      : b.MONTHLY_DAYS.find((d) => d.day === day);

  return { ...b, byId, nameOf, deitiesOf, CATEGORIES: categories, festivalsOfMonth, festivalOn, sacredDay };
}

/** Musica — SPEC.md §3.5. Sono link, non cambiano con la lingua. */
export const MUSIC = [
  { service: 'YouTube', t: 'Musica greca antica (lira)', tEn: 'Ancient Greek music (lyre)', url: 'https://www.youtube.com/results?search_query=ancient+greek+music+lyre+reconstructed' },
  { service: 'YouTube', t: 'Inni Orfici e Omerici', tEn: 'Orphic and Homeric Hymns', url: 'https://www.youtube.com/results?search_query=orphic+hymns+chanted' },
  { service: 'YouTube', t: 'Ambiente per la preghiera', tEn: 'Ambient for prayer', url: 'https://www.youtube.com/results?search_query=hellenic+polytheism+ritual+ambient+meditation' },
  { service: 'Spotify', t: 'Ancient Greek Music', tEn: 'Ancient Greek Music', url: 'https://open.spotify.com/search/ancient%20greek%20music' },
  { service: 'Spotify', t: 'Lyre & meditation', tEn: 'Lyre & meditation', url: 'https://open.spotify.com/search/greek%20lyre%20meditation' },
];
