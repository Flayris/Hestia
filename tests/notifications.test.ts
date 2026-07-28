import { describe, it, expect } from 'vitest';
import { upcoming } from '../src/lib/notifications';
import { dataEllenica, dayToDate } from '../src/lib/calendar';

/** Istante di mezzogiorno del giorno lunare `n` del mese in corso. */
function mezzogiornoDelGiorno(n: number): Date {
  const oggi = dataEllenica();
  return new Date(dayToDate(oggi.month.start + n - 1).getTime() + 12 * 3600_000);
}

describe('centro notifiche — orizzonte di 7 giorni', () => {
  it('non mostra mai nulla oltre i 7 giorni', () => {
    for (let g = 1; g <= 29; g++) {
      for (const n of upcoming([], mezzogiornoDelGiorno(g))) {
        expect(n.daysAway, `giorno ${g}: "${n.title}" a ${n.daysAway} giorni`).toBeLessThanOrEqual(7);
        expect(n.daysAway).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('nei giorni tranquilli la lista è vuota, così la sezione sparisce', () => {
    // Hekatombaiṓn 14: i giorni sacri 1-8 sono passati, Panathḗnaia è al 28.
    expect(upcoming([], mezzogiornoDelGiorno(14))).toHaveLength(0);
  });

  it('riappare avvicinandosi a una festa', () => {
    // Panathḗnaia cade il 28: al giorno 22 mancano 6 giorni, quindi rientra.
    const lista = upcoming([], mezzogiornoDelGiorno(22));
    expect(lista.some((n) => n.title === 'Panathḗnaia')).toBe(true);
    expect(lista.find((n) => n.title === 'Panathḗnaia')!.daysAway).toBe(6);
  });

  it('a fine mese guarda già nel mese successivo', () => {
    // Dal Deîpnon si devono vedere Noumenía e i primi giorni sacri del mese nuovo.
    const lista = upcoming([], mezzogiornoDelGiorno(29));
    expect(lista.some((n) => n.type === 'noumenia')).toBe(true);
    expect(lista.some((n) => n.type === 'deipnon')).toBe(true);
    expect(lista.every((n) => n.daysAway <= 7)).toBe(true);
  });

  it('segnala i giorni dei tuoi dèi', () => {
    // Al giorno 1, Artemide (giorno 6) è a 5 giorni.
    const senza = upcoming([], mezzogiornoDelGiorno(1)).find((n) => n.title === 'Artemide');
    const con = upcoming(['artemide'], mezzogiornoDelGiorno(1)).find((n) => n.title === 'Artemide');
    expect(senza?.type).toBe('monthlyDay');
    expect(con?.type).toBe('myGod');
    expect(con?.subtitle).toContain('tuoi dèi');
  });
});
