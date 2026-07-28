import type { AppNotification } from '../types';
import { festivalsOfMonth, MONTHLY_DAYS, nameOf } from '../data/content';
import { hellenicDate } from './calendar/stub';

/**
 * Centro notifiche — SPEC.md §6.
 * La lista è CALCOLATA a ogni apertura, mai programmata.
 * Scala di preavviso: 1 mese → 1 settimana → 2 giorni → oggi.
 */

export function relativeDay(n: number): string {
  if (n === 0) return 'oggi';
  if (n === 1) return 'domani';
  if (n === 2) return 'dopodomani';
  return `fra ${n} giorni`;
}

const names = (ids: string[]) => ids.map(nameOf).join(', ');

export function upcoming(myGods: string[], now: Date = new Date()): AppNotification[] {
  const today = hellenicDate(now);
  const out: AppNotification[] = [];

  for (const f of festivalsOfMonth(today.monthName)) {
    const away = f.d - today.day;
    if (away < 0 || away > 30) continue;
    out.push({
      id: `festival-${today.monthName}-${f.d}`,
      type: 'festival',
      title: f.n,
      subtitle: `${relativeDay(away)} · ${names(f.gods)}`,
      daysAway: away,
    });
  }

  for (const d of MONTHLY_DAYS) {
    if (d.day === 'ultimo') continue;
    const away = (d.day as number) - today.day;
    if (away < 0 || away > 30) continue;
    const mine = d.gods.some((g) => myGods.includes(g));
    out.push({
      id: `monthly-${today.monthName}-${d.day}`,
      type: mine ? 'myGod' : 'monthlyDay',
      title: names(d.gods),
      subtitle: mine
        ? `${relativeDay(away)} · è il giorno di uno dei tuoi dèi`
        : `${relativeDay(away)} · giorno sacro`,
      daysAway: away,
    });
  }

  const toDeipnon = today.monthLength - today.day;
  if (toDeipnon >= 0) {
    out.push({
      id: `deipnon-${today.monthName}`,
      type: 'deipnon',
      title: 'Deîpnon',
      subtitle: `${relativeDay(toDeipnon)} · la Cena di Ecate chiude il mese`,
      daysAway: toDeipnon,
    });
    out.push({
      id: `noumenia-${today.monthName}`,
      type: 'noumenia',
      title: 'Noumenía',
      subtitle: `${relativeDay(toDeipnon + 1)} · il mese si apre con Selene, Apollo ed Estia`,
      daysAway: toDeipnon + 1,
    });
  }

  return out.sort((a, b) => a.daysAway - b.daysAway);
}
