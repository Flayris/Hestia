import type { AppNotification } from '../types';
import { festivalsOfMonth, MONTHLY_DAYS, nameOf } from '../data/content';
import { dataEllenica, shiftMonth, type HellenicMonth } from './calendar';

/**
 * Centro notifiche — SPEC.md §6.
 * La lista è CALCOLATA a ogni apertura, mai programmata.
 * Scala di preavviso: 1 mese → 1 settimana → 2 giorni → oggi.
 */

const ORIZZONTE = 31;   // giorni

export function relativeDay(n: number): string {
  if (n === 0) return 'oggi';
  if (n === 1) return 'domani';
  if (n === 2) return 'dopodomani';
  return `fra ${n} giorni`;
}

const names = (ids: string[]) => ids.map(nameOf).join(', ');

export function upcoming(myGods: string[], now: Date = new Date()): AppNotification[] {
  const oggi = dataEllenica(now);
  const out: AppNotification[] = [];

  /** Raccoglie gli eventi di un mese, misurando la distanza dal giorno corrente. */
  const scan = (m: HellenicMonth) => {
    const offset = m.start - oggi.civil;      // giorni fra oggi e la Noumenía del mese

    for (const f of festivalsOfMonth(m.name)) {
      const away = offset + f.d - 1;
      if (away < 0 || away > ORIZZONTE) continue;
      out.push({
        id: `festival-${m.start}-${f.d}`,
        type: 'festival',
        title: f.n,
        subtitle: `${relativeDay(away)} · ${names(f.gods)}`,
        daysAway: away,
      });
    }

    for (const d of MONTHLY_DAYS) {
      const giorno = d.day === 'ultimo' ? m.length : (d.day as number);
      const away = offset + giorno - 1;
      if (away < 0 || away > ORIZZONTE) continue;

      const mine = d.gods.some((g) => myGods.includes(g));
      const isDeipnon = d.day === 'ultimo';
      const isNoumenia = giorno === 1;

      out.push({
        id: `sacro-${m.start}-${d.day}`,
        type: isDeipnon ? 'deipnon' : isNoumenia ? 'noumenia' : mine ? 'myGod' : 'monthlyDay',
        title: isDeipnon ? 'Deîpnon' : isNoumenia ? 'Noumenía' : names(d.gods),
        subtitle: isDeipnon
          ? `${relativeDay(away)} · la Cena di Ecate chiude il mese`
          : isNoumenia
            ? `${relativeDay(away)} · il mese si apre con ${names(d.gods)}`
            : mine
              ? `${relativeDay(away)} · è il giorno di uno dei tuoi dèi`
              : `${relativeDay(away)} · giorno sacro`,
        daysAway: away,
      });
    }
  };

  // Mese corrente e successivo: a fine mese ciò che conta sta già oltre il Deîpnon.
  scan(oggi.month);
  scan(shiftMonth(oggi.month, +1));

  return out.sort((a, b) => a.daysAway - b.daysAway);
}
