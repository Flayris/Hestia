import type { AppNotification } from '../types';
import { festivalsOfMonth, MONTHLY_DAYS, nameOf } from '../data/content';
import { dataEllenica, shiftMonth, type HellenicMonth } from './calendar';
import { dict } from '../i18n';
import type { Lang } from '../settings';

/**
 * Centro notifiche — SPEC.md §6.
 * La lista è CALCOLATA a ogni apertura, mai programmata.
 * Scala di preavviso: 1 mese → 1 settimana → 2 giorni → oggi.
 */

/**
 * Orizzonte del centro notifiche: una settimana.
 * Più in là l'elenco si affolla di cose ancora lontane e smette di essere utile.
 * Il calendario resta il posto dove guardare oltre.
 */
const ORIZZONTE = 7;   // giorni

export function relativeDay(n: number, lang: Lang = 'it'): string {
  const t = dict(lang);
  if (n === 0) return t.today;
  if (n === 1) return t.tomorrow;
  if (n === 2) return t.dayAfter;
  return t.inDays(n);
}

const names = (ids: string[]) => ids.map(nameOf).join(', ');

export function upcoming(myGods: string[], now: Date = new Date(), lang: Lang = 'it'): AppNotification[] {
  const t = dict(lang);
  const rel = (n: number) => relativeDay(n, lang);
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
        subtitle: `${rel(away)} · ${names(f.gods)}`,
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
          ? `${rel(away)} · ${t.deipnonSub}`
          : isNoumenia
            ? `${rel(away)} · ${t.noumeniaSub(names(d.gods))}`
            : mine
              ? `${rel(away)} · ${t.yourGodDay}`
              : `${rel(away)} · ${t.sacredDay}`,
        daysAway: away,
      });
    }
  };

  // Mese corrente e successivo: a fine mese ciò che conta sta già oltre il Deîpnon.
  scan(oggi.month);
  scan(shiftMonth(oggi.month, +1));

  return out.sort((a, b) => a.daysAway - b.daysAway);
}
