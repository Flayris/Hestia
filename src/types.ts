/* Modello dati — SPEC.md §4 */

export type CategoryKey =
  | 'olimpi' | 'ctonii' | 'marini' | 'titani'
  | 'primordiali' | 'rustici' | 'personificati' | 'eroi';

export interface Deity {
  id: string;
  n: string;
  gk: string;
  ep: string;
  cats: CategoryKey[];
  intro: string;
  dom: string[];
  sim: string[];
  off: string[];
  allora: string;
  adesso: string;
  inno?: string;
  src?: string;
}

export interface Category {
  key: CategoryKey;
  label: string;
  desc: string;
  sym: string;
  count: number;
}

export interface Festival {
  d: number;
  n: string;
  gods: string[];
  allora: string;
  adesso: string;
}

export interface MonthlySacredDay {
  day: number | 'ultimo';
  gods: string[];
  note: string;
}

/** Un giorno del calendario ateniese. Prodotto dal motore (M1), oggi dallo stub. */
export interface HellenicDate {
  monthName: string;
  day: number;
  monthLength: number;
  yearLabel: string;
  isNoumenia: boolean;
  isDeipnon: boolean;
  gregorian: Date;
}

export interface AppNotification {
  id: string;
  type: 'noumenia' | 'deipnon' | 'festival' | 'myGod' | 'monthlyDay';
  title: string;
  subtitle: string;
  daysAway: number;
}
