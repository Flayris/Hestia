import { newMoonJD, juneSolsticeJD, kFromYear, SYNODIC_MONTH } from './meeus';

/**
 * Calendario ateniese — SPEC.md §5.
 *
 * Regola d'oro: gli istanti astronomici vengono convertiti in **date civili
 * locali** e da lì in poi si confrontano solo date, mai istanti. È questo che
 * fa adattare il calendario al fuso del dispositivo (Italia → USA) da solo.
 *
 * Una data civile è rappresentata come `Day`: il numero di giorni dal
 * 1° gennaio 1970. Intero, senza ore, immune ai cambi di ora legale.
 */

export type Day = number;

export const MONTH_NAMES = [
  'Hekatombaiṓn', 'Metageitniṓn', 'Boēdromiṓn', 'Pyanepsiṓn',
  'Maimaktēriṓn', 'Poseideṓn', 'Gamēliṓn', 'Anthestēriṓn',
  'Elaphēboliṓn', 'Mounichiṓn', 'Thargēliṓn', 'Skirophoriṓn',
];

const MS_DAY = 86_400_000;
const JD_UNIX_EPOCH = 2440587.5;

/** Formatta un istante nel fuso indicato e ne ricava la data civile. */
function civilPartsInZone(ms: number, timeZone?: string) {
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  });
  const [y, m, d] = f.format(new Date(ms)).split('-').map(Number);
  return { y, m, d };
}

const partsToDay = (y: number, m: number, d: number): Day =>
  Math.round(Date.UTC(y, m - 1, d) / MS_DAY);

/** Giorno Giuliano → data civile nel fuso locale (o in quello indicato). */
export function jdToDay(jd: number, timeZone?: string): Day {
  const ms = (jd - JD_UNIX_EPOCH) * MS_DAY;
  const { y, m, d } = civilPartsInZone(ms, timeZone);
  return partsToDay(y, m, d);
}

/** Data civile di "adesso" nel fuso indicato. */
export function today(now: Date = new Date(), timeZone?: string): Day {
  const { y, m, d } = civilPartsInZone(now.getTime(), timeZone);
  return partsToDay(y, m, d);
}

/** Day → oggetto Date (mezzanotte UTC: da usare solo per leggere Y/M/D e il giorno della settimana). */
export const dayToDate = (day: Day): Date => new Date(day * MS_DAY);

/** 0 = lunedì … 6 = domenica. */
export const weekday = (day: Day): number => (dayToDate(day).getUTCDay() + 6) % 7;

/**
 * Noumenía della lunazione `k`: data civile della congiunzione **più un giorno**
 * (prima visibilità della falce). Configurabile — SPEC.md §5.1 punto 9.
 */
export type NoumeniaRule = 'firstVisibility' | 'conjunction';

export function noumenia(k: number, tz?: string, rule: NoumeniaRule = 'firstVisibility'): Day {
  return jdToDay(newMoonJD(k), tz) + (rule === 'firstVisibility' ? 1 : 0);
}

export interface HellenicMonth {
  index: number;          // 0-based nell'anno
  name: string;
  start: Day;             // Noumenía
  length: number;         // 29 o 30
  intercalary: boolean;
}

export interface HellenicYear {
  /** Anno gregoriano in cui cade Hekatombaiṓn 1. */
  gregorianYear: number;
  start: Day;
  months: HellenicMonth[];
  intercalary: boolean;
  /** k della lunazione di Hekatombaiṓn 1. */
  k0: number;
}

/** k della prima Noumenía a partire dal solstizio d'estate dell'anno indicato. */
function firstK(gregorianYear: number, tz?: string, rule?: NoumeniaRule): number {
  const solstice = jdToDay(juneSolsticeJD(gregorianYear), tz);
  let k = Math.floor(kFromYear(gregorianYear + 0.4)) - 2;
  while (noumenia(k, tz, rule) < solstice) k++;
  while (noumenia(k - 1, tz, rule) >= solstice) k--;
  return k;
}

const cache = new Map<string, HellenicYear>();

/** Costruisce l'anno ellenico che inizia nell'anno gregoriano indicato. */
export function buildYear(gregorianYear: number, tz?: string, rule?: NoumeniaRule): HellenicYear {
  const key = `${gregorianYear}|${tz ?? ''}|${rule ?? ''}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const k0 = firstK(gregorianYear, tz, rule);
  const kNext = firstK(gregorianYear + 1, tz, rule);
  const count = kNext - k0;                       // 12 lunazioni, 13 se intercalare
  const intercalary = count === 13;

  const names = [...MONTH_NAMES];
  if (intercalary) names.splice(6, 0, 'Poseideṓn deúteros');

  const months: HellenicMonth[] = [];
  for (let i = 0; i < count; i++) {
    const start = noumenia(k0 + i, tz, rule);
    const next = noumenia(k0 + i + 1, tz, rule);
    months.push({
      index: i,
      name: names[i] ?? `mese ${i + 1}`,
      start,
      length: next - start,
      intercalary: intercalary && i === 6,
    });
  }

  const year: HellenicYear = { gregorianYear, start: months[0].start, months, intercalary, k0 };
  cache.set(key, year);
  return year;
}

export interface Located {
  year: HellenicYear;
  month: HellenicMonth;
  /** Numero del giorno lunare, da 1. */
  day: number;
  isNoumenia: boolean;
  isDeipnon: boolean;
  civil: Day;
}

/** Trova a quale mese e giorno ellenico corrisponde una data civile. */
export function locate(civil: Day, tz?: string, rule?: NoumeniaRule): Located {
  const approx = dayToDate(civil).getUTCFullYear();
  let year = buildYear(approx, tz, rule);
  if (civil < year.start) year = buildYear(approx - 1, tz, rule);

  const last = year.months[year.months.length - 1];
  if (civil >= last.start + last.length) year = buildYear(approx + 1, tz, rule);

  const month = year.months.find((m) => civil >= m.start && civil < m.start + m.length)
    ?? year.months[year.months.length - 1];

  const day = civil - month.start + 1;
  return {
    year, month, day, civil,
    isNoumenia: day === 1,
    isDeipnon: day === month.length,
  };
}

/** Il mese successivo o precedente a quello dato, attraversando gli anni. */
export function shiftMonth(m: HellenicMonth, delta: number, tz?: string, rule?: NoumeniaRule): HellenicMonth {
  const anyDay = m.start + Math.floor(m.length / 2);
  const here = locate(anyDay, tz, rule);
  const i = here.month.index + delta;
  const { year } = here;

  if (i >= 0 && i < year.months.length) return year.months[i];

  const target = buildYear(year.gregorianYear + (i < 0 ? -1 : 1), tz, rule);
  return i < 0 ? target.months[target.months.length - 1] : target.months[0];
}

/**
 * Frazione del ciclo lunare: 0 = luna nuova, 0.5 = piena.
 * Calcolata sull'istante reale, non sulla data civile.
 */
export function moonPhase(now: Date = new Date()): number {
  const jd = now.getTime() / MS_DAY + JD_UNIX_EPOCH;
  let k = Math.floor(kFromYear(now.getUTCFullYear() + (now.getUTCMonth() + 0.5) / 12));
  while (newMoonJD(k) > jd) k--;
  while (newMoonJD(k + 1) <= jd) k++;
  const prev = newMoonJD(k);
  const next = newMoonJD(k + 1);
  return (jd - prev) / (next - prev || SYNODIC_MONTH);
}
