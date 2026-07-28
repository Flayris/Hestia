import type { Category, CategoryKey, Festival, MonthlySacredDay } from '../types';
import index from './deities.index.json';

/**
 * Contenuti disponibili in questa fase.
 *
 * `deities.index.json` è estratto da `_input/Hestia - Grimorio completo_1.md`
 * e contiene i 67 record con nome, greco, epiteto e categorie.
 * I testi completi (intro, domini, simboli, offerte, allora, adesso, invocazione,
 * fonte) arrivano con la conversione in M5.
 */

export interface DeityIndexEntry {
  id: string;
  n: string;
  gk: string;
  ep: string;
  cats: CategoryKey[];
}

export const DEITIES = index as DeityIndexEntry[];

export const byId = (id: string) => DEITIES.find((d) => d.id === id);

export const CATEGORIES: Category[] = [
  { key: 'olimpi',       label: 'Dèi Olimpi',        desc: 'I dodici e gli dèi del cielo',      sym: 'Ω', count: 14 },
  { key: 'ctonii',       label: 'Dèi Ctonii',        desc: 'Oltretomba e mondo sotterraneo',    sym: 'Ψ', count: 7 },
  { key: 'marini',       label: 'Dèi Marini',        desc: 'Mare, onde e acque',                sym: '≈', count: 7 },
  { key: 'titani',       label: 'Titani e Astri',    desc: 'Titani, sole, luna, aurora',        sym: '☉', count: 8 },
  { key: 'primordiali',  label: 'Primordiali',       desc: 'Le origini del cosmo',              sym: '◍', count: 6 },
  { key: 'rustici',      label: 'Nature e Campagne', desc: 'Pan, ninfe, spiriti dei boschi',    sym: '❦', count: 7 },
  { key: 'personificati',label: 'Personificazioni',  desc: 'Muse, Grazie, Destino, Sorte',      sym: '✦', count: 10 },
  { key: 'eroi',         label: 'Eroi',              desc: 'Culto degli eroi e patroni',        sym: 'Η', count: 10 },
];

export const categoryOf = (key: CategoryKey) => CATEGORIES.find((c) => c.key === key)!;

/** Giorni sacri che ricorrono in ogni mese lunare — SPEC.md §4.1 */
export const MONTHLY_DAYS: MonthlySacredDay[] = [
  { day: 1, gods: ['selene', 'apollo', 'estia'], note: 'Noumenía — la luna nuova apre il mese. Si onorano gli dèi domestici, Selene e Apollo Noumenios.' },
  { day: 2, gods: ['agathos-daimon'], note: 'Giorno di Agathòs Daímōn, il buon spirito della casa.' },
  { day: 3, gods: ['atena'], note: 'Giorno sacro ad Atena.' },
  { day: 4, gods: ['afrodite', 'ermes'], note: 'Giorno di Afrodite ed Ermes (anche Eros ed Eracle).' },
  { day: 6, gods: ['artemide'], note: 'Giorno sacro ad Artemide.' },
  { day: 7, gods: ['apollo'], note: 'Giorno sacro ad Apollo.' },
  { day: 8, gods: ['poseidone'], note: 'Giorno di Poseidone (e dell’eroe Teseo).' },
  { day: 'ultimo', gods: ['ecate'], note: 'Deîpnon — l’ultimo giorno del mese (luna scura). La Cena di Ecate agli incroci e la pulizia della casa chiudono il ciclo lunare.' },
];

export function sacredDay(day: number, monthLength: number): MonthlySacredDay | undefined {
  if (day === monthLength) return MONTHLY_DAYS.find((d) => d.day === 'ultimo');
  return MONTHLY_DAYS.find((d) => d.day === day);
}

/** Feste del mese in corso — testi originali dal grimorio. */
export const FESTIVALS_THIS_MONTH: Festival[] = [
  {
    d: 12,
    n: 'Krónia',
    gods: ['crono', 'zeus'],
    allora: 'Festa di Crono e del raccolto: padroni e servi banchettavano insieme, sospendendo le gerarchie.',
    adesso: 'Un pasto di ringraziamento per l’abbondanza, condiviso in semplicità e uguaglianza.',
  },
  {
    d: 28,
    n: 'Panathḗnaia',
    gods: ['atena'],
    allora: 'La grande festa di Atena, patrona della città: processione, giochi e l’offerta del peplo tessuto.',
    adesso: 'Dedica ad Atena un lavoro fatto con cura, olio d’oliva e un momento di studio o creatività.',
  },
];

export const festivalOn = (day: number) => FESTIVALS_THIS_MONTH.find((f) => f.d === day);

/** Riti base — SPEC.md §3.3 */
export const RITES = [
  { n: 'Khérnips', sub: 'l’acqua lustrale' },
  { n: 'Spondḗ', sub: 'la libagione' },
  { n: 'Offerta quotidiana', sub: 'mattino e sera' },
  { n: 'La triade lunare', sub: 'Deîpnon · Noumenía · Agathòs Daímōn' },
  { n: 'Estia prima e ultima', sub: 'l’apertura e la chiusura di ogni rito' },
];

/** Concetti, sezione "Altro" — SPEC.md §3.3 */
export const CONCEPTS = [
  { n: 'Kháris', sub: 'la reciprocità' },
  { n: 'Míasma e kátharsis', sub: 'la purità rituale' },
  { n: 'Gli dèi ctonii', sub: 'come onorarli' },
  { n: 'Il tuo altare domestico', sub: 'costruirlo e curarlo' },
];

/** Musica — SPEC.md §3.5 */
export const MUSIC = [
  { service: 'YouTube', t: 'Musica greca antica (lira)', url: 'https://www.youtube.com/results?search_query=ancient+greek+music+lyre+reconstructed' },
  { service: 'YouTube', t: 'Inni Orfici e Omerici', url: 'https://www.youtube.com/results?search_query=orphic+hymns+chanted' },
  { service: 'YouTube', t: 'Ambiente per la preghiera', url: 'https://www.youtube.com/results?search_query=hellenic+polytheism+ritual+ambient+meditation' },
  { service: 'Spotify', t: 'Ancient Greek Music', url: 'https://open.spotify.com/search/ancient%20greek%20music' },
  { service: 'Spotify', t: 'Lyre & meditation', url: 'https://open.spotify.com/search/greek%20lyre%20meditation' },
];
