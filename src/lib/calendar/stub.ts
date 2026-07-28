import type { HellenicDate } from '../../types';

/**
 * STUB del motore del calendario — da sostituire in M1.
 *
 * Espone già l'interfaccia definitiva (`hellenicDate`, `moonPhase`): quando arriva
 * il motore vero (Meeus cap. 49, SPEC.md §5) cambia solo l'implementazione, non la UI.
 *
 * Dati fissi del mese in corso: Hekatombaiṓn 2026, Noumenía mercoledì 15 luglio
 * (luna nuova il 14), Deîpnon mercoledì 12 agosto. 29 giorni.
 */

const NOUMENIA = new Date(2026, 6, 15);          // 15 luglio 2026, ora locale
const MONTH_LENGTH = 29;
const NEW_MOON_PREV = new Date(2026, 6, 14, 4, 44);
const SYNODIC_DAYS = 29.530588;

export const MONTH_NAME = 'Hekatombaiṓn';
export const YEAR_LABEL = 'anno 1° della 700ª Olimpiade';

/** Mezzanotte locale: tutti i confronti avvengono fra date civili, mai fra istanti. */
export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86_400_000);
}

/** Data del giorno lunare `n` del mese corrente. */
export function gregorianOfDay(n: number): Date {
  const d = new Date(NOUMENIA);
  d.setDate(d.getDate() + (n - 1));
  return d;
}

export function hellenicDate(now: Date = new Date()): HellenicDate {
  const offset = daysBetween(NOUMENIA, now);
  const day = Math.min(Math.max(offset + 1, 1), MONTH_LENGTH);
  return {
    monthName: MONTH_NAME,
    day,
    monthLength: MONTH_LENGTH,
    yearLabel: YEAR_LABEL,
    isNoumenia: day === 1,
    isDeipnon: day === MONTH_LENGTH,
    gregorian: startOfDay(now),
  };
}

/** Frazione del ciclo lunare: 0 = luna nuova, 0.5 = piena. */
export function moonPhase(now: Date = new Date()): number {
  const elapsed = (now.getTime() - NEW_MOON_PREV.getTime()) / 86_400_000;
  return ((elapsed / SYNODIC_DAYS) % 1 + 1) % 1;
}
