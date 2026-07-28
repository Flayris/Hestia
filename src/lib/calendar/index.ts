import { locate, today, dayToDate, type Day, type Located, type HellenicMonth } from './athenian';

export * from './athenian';
export { newMoonJD, juneSolsticeJD } from './meeus';

/**
 * Interfaccia usata dalle schermate. Il fuso è quello del dispositivo:
 * non passiamo mai un fuso fisso, così il calendario segue l'utente.
 */

export const oggi = (now: Date = new Date()): Day => today(now);

export const dataEllenica = (now: Date = new Date()): Located => locate(today(now));

const GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
  'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

/** "martedì 28 luglio 2026" */
export function gregorianoEsteso(day: Day): string {
  const d = dayToDate(day);
  return `${GIORNI[d.getUTCDay()]} ${d.getUTCDate()} ${MESI[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "28/7" */
export function gregorianoBreve(day: Day): string {
  const d = dayToDate(day);
  return `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
}

/**
 * Etichetta dell'anno ellenico: l'anno lunare parte a luglio e scavalca il
 * capodanno gregoriano, quindi si indica con l'intervallo.
 *
 * Deliberatamente NON si indica il numero di Olimpiade: le numerazioni moderne
 * divergono e la specifica vieta di dare per certo ciò che non è verificabile
 * sulle fonti (SPEC.md §7).
 */
export function etichettaAnno(m: HellenicMonth): string {
  const anno = locate(m.start).year;
  const ultimo = anno.months[anno.months.length - 1];
  // L'intervallo è quello dell'ANNO ellenico, non del mese che si sta guardando.
  const inizio = dayToDate(anno.start).getUTCFullYear();
  const fine = dayToDate(ultimo.start + ultimo.length - 1).getUTCFullYear();
  return inizio === fine ? `anno ellenico ${inizio}` : `anno ellenico ${inizio}–${fine}`;
}
