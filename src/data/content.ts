import type { Category, CategoryKey, Deity, Festival, MonthlySacredDay, Rite, Concept } from '../types';
import gods from './gods.json';
import festivalsJson from './festivals.json';
import ritesJson from './rites.json';
import conceptsJson from './concepts.json';
import monthlyJson from './monthlyDays.json';

/**
 * Contenuti del Grimorio.
 * Generati da `_input/Hestia - Grimorio completo_1.md` con
 * `node scripts/build-content.mjs` — non modificare questi JSON a mano.
 */

export const DEITIES = gods as Deity[];
export const RITES = ritesJson as Rite[];
export const CONCEPTS = conceptsJson as Concept[];
export const MONTHLY_DAYS = monthlyJson as MonthlySacredDay[];
export const FESTIVALS = festivalsJson as Record<string, Festival[]>;

export const byId = (id: string) => DEITIES.find((d) => d.id === id);
export const nameOf = (id: string) => byId(id)?.n ?? id;

export const CATEGORIES: Category[] = [
  { key: 'olimpi',        label: 'Dèi Olimpi',        desc: 'I dodici e gli dèi del cielo',   sym: 'Ω' },
  { key: 'ctonii',        label: 'Dèi Ctonii',        desc: 'Oltretomba e mondo sotterraneo', sym: 'Ψ' },
  { key: 'marini',        label: 'Dèi Marini',        desc: 'Mare, onde e acque',             sym: '≈' },
  { key: 'titani',        label: 'Titani e Astri',    desc: 'Titani, sole, luna, aurora',     sym: '☉' },
  { key: 'primordiali',   label: 'Primordiali',       desc: 'Le origini del cosmo',           sym: '◍' },
  { key: 'rustici',       label: 'Nature e Campagne', desc: 'Pan, ninfe, spiriti dei boschi', sym: '❦' },
  { key: 'personificati', label: 'Personificazioni',  desc: 'Muse, Grazie, Destino, Sorte',   sym: '✦' },
  { key: 'eroi',          label: 'Eroi',              desc: 'Culto degli eroi e patroni',     sym: 'Η' },
].map((c) => ({ ...c, count: DEITIES.filter((d) => d.cats.includes(c.key as CategoryKey)).length })) as Category[];

export const categoryOf = (key: CategoryKey) => CATEGORIES.find((c) => c.key === key)!;
export const deitiesOf = (key: CategoryKey) => DEITIES.filter((d) => d.cats.includes(key));

/** Ordine dei mesi ellenici — SPEC.md §5.1 */
export const MONTHS = [
  'Hekatombaiṓn', 'Metageitniṓn', 'Boēdromiṓn', 'Pyanepsiṓn',
  'Maimaktēriṓn', 'Poseideṓn', 'Gamēliṓn', 'Anthestēriṓn',
  'Elaphēboliṓn', 'Mounichiṓn', 'Thargēliṓn', 'Skirophoriṓn',
];

/** Le feste sono indicizzate per nome base del mese (il Poseideṓn deúteros usa le stesse). */
export const festivalsOfMonth = (month: string): Festival[] =>
  FESTIVALS[month.replace(/ deúteros$/, '')] ?? [];

export const festivalOn = (month: string, day: number) =>
  festivalsOfMonth(month).find((f) => f.d === day);

export function sacredDay(day: number, monthLength: number): MonthlySacredDay | undefined {
  if (day === monthLength) return MONTHLY_DAYS.find((d) => d.day === 'ultimo');
  return MONTHLY_DAYS.find((d) => d.day === day);
}

/** Musica — SPEC.md §3.5 */
export const MUSIC = [
  { service: 'YouTube', t: 'Musica greca antica (lira)', url: 'https://www.youtube.com/results?search_query=ancient+greek+music+lyre+reconstructed' },
  { service: 'YouTube', t: 'Inni Orfici e Omerici', url: 'https://www.youtube.com/results?search_query=orphic+hymns+chanted' },
  { service: 'YouTube', t: 'Ambiente per la preghiera', url: 'https://www.youtube.com/results?search_query=hellenic+polytheism+ritual+ambient+meditation' },
  { service: 'Spotify', t: 'Ancient Greek Music', url: 'https://open.spotify.com/search/ancient%20greek%20music' },
  { service: 'Spotify', t: 'Lyre & meditation', url: 'https://open.spotify.com/search/greek%20lyre%20meditation' },
];
