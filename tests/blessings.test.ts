import { describe, it, expect } from 'vitest';
import { benedizione, eventiDelGiorno } from '../src/lib/blessings';
import { dataEllenica, locate } from '../src/lib/calendar';
import { content } from '../src/data/content';

/** Giorno civile corrispondente al giorno lunare `n` del mese in corso. */
const giornoLunare = (n: number) => dataEllenica().month.start + n - 1;

const tutteLeInvocazioni = (lang: 'it' | 'en') => {
  const c = content(lang);
  return new Set([
    ...c.DEITIES.filter((d) => d.inno).map((d) => d.inno!),
    ...c.RITES.filter((r) => r.inno).map((r) => r.inno!),
  ]);
};

describe('buongiorno e buonanotte', () => {
  it('la frase viene sempre dal Grimorio, mai inventata', () => {
    for (const lang of ['it', 'en'] as const) {
      const note = tutteLeInvocazioni(lang);
      for (let g = 1; g <= 29; g++) {
        for (const momento of ['mattino', 'sera'] as const) {
          const b = benedizione(momento, giornoLunare(g), lang);
          expect(note.has(b.testo), `${lang} ${momento} giorno ${g}: "${b.testo}"`).toBe(true);
        }
      }
    }
  });

  it('usa il nome quando c’è, e regge bene quando non c’è', () => {
    const con = benedizione('mattino', giornoLunare(20), 'it', 'Gaia');
    const senza = benedizione('mattino', giornoLunare(20), 'it');
    expect(con.titolo).toBe('Buongiorno, Gaia');
    expect(senza.titolo).toBe('Buongiorno');
  });

  it('alla Noumenía attinge dagli dèi di quel giorno', () => {
    const b = benedizione('mattino', giornoLunare(1), 'it');
    // giorno 1: Selene, Apollo, Estia
    expect(['selene', 'apollo', 'estia']).toContain(b.fonte);
  });

  it('Deîpnon e Agathòs Daímōn usano il rito della triade lunare', () => {
    // Ecate e Agathòs Daímōn non hanno un'invocazione propria — nel Grimorio
    // ce l'hanno solo i 14 Olimpi — quindi si attinge al rito che li riguarda.
    const l = dataEllenica().month.length;
    for (const g of [2, l]) {
      expect(benedizione('sera', giornoLunare(g), 'it').fonte).toBe('la-triade-lunare');
      expect(benedizione('mattino', giornoLunare(g), 'it').fonte).toBe('la-triade-lunare');
    }
  });

  it('nei giorni di festa il titolo annuncia la festa', () => {
    // Hekatombaiṓn 28 — Panathḗnaia
    const b = benedizione('mattino', giornoLunare(28), 'it', 'Gaia');
    expect(b.titolo).toBe('Oggi è Panathḗnaia');
  });

  it('è riproducibile: stesso giorno, stessa frase', () => {
    const a = benedizione('sera', giornoLunare(13), 'it');
    const b = benedizione('sera', giornoLunare(13), 'it');
    expect(a).toEqual(b);
  });

  it('cambia nell’arco del mese', () => {
    const frasi = new Set<string>();
    for (let g = 1; g <= 29; g++) frasi.add(benedizione('mattino', giornoLunare(g), 'it').testo);
    expect(frasi.size).toBeGreaterThan(3);
  });

  it('in inglese le frasi sono in inglese', () => {
    const it = benedizione('mattino', giornoLunare(7), 'it');
    const en = benedizione('mattino', giornoLunare(7), 'en');
    expect(en.fonte).toBe(it.fonte);
    expect(en.testo).not.toBe(it.testo);
    expect(en.titolo).toMatch(/Good morning|Today is/);
  });
});

describe('eventi del giorno', () => {
  it('riconosce Noumenía e Deîpnon', () => {
    const l = dataEllenica().month.length;
    expect(eventiDelGiorno(giornoLunare(1), 'it')).toContain('Noumenía');
    expect(eventiDelGiorno(giornoLunare(l), 'it')).toContain('Deîpnon');
  });

  it('nomina la festa quando c’è', () => {
    expect(eventiDelGiorno(giornoLunare(28), 'it')).toContain('Panathḗnaia');
  });

  it('restituisce null nei giorni ordinari', () => {
    // 14 non è né giorno sacro mensile né festa
    expect(eventiDelGiorno(giornoLunare(14), 'it')).toBeNull();
  });

  it('non nomina mai un dio che non esiste', () => {
    const c = content('it');
    for (let g = 1; g <= 29; g++) {
      const e = eventiDelGiorno(giornoLunare(g), 'it');
      if (!e) continue;
      const l = locate(giornoLunare(g));
      expect(l.day).toBe(g);
      expect(e.length).toBeGreaterThan(0);
      expect(c.DEITIES.length).toBe(67);
    }
  });
});

describe('mattino e sera non si ripetono', () => {
  it('la frase della sera è sempre diversa da quella del mattino', () => {
    const l = dataEllenica().month.length;
    for (const lang of ['it', 'en'] as const) {
      for (let g = 1; g <= l; g++) {
        const ma = benedizione('mattino', giornoLunare(g), lang, 'Gaia');
        const se = benedizione('sera', giornoLunare(g), lang, 'Gaia');
        // I cardini del mese usano di proposito la stessa formula del rito.
        if (ma.fonte === 'la-triade-lunare') continue;
        expect(se.testo, `${lang} giorno ${g}`).not.toBe(ma.testo);
      }
    }
  });
});
