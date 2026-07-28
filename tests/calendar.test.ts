import { describe, it, expect } from 'vitest';
import { newMoonJD, juneSolsticeJD, kFromYear } from '../src/lib/calendar/meeus';
import {
  buildYear, locate, today, jdToDay, dayToDate, weekday, shiftMonth, moonPhase, MONTH_NAMES,
} from '../src/lib/calendar/athenian';

const ROMA = 'Europe/Rome';
const NEW_YORK = 'America/New_York';

const iso = (day: number) => dayToDate(day).toISOString().slice(0, 10);
const dayOf = (s: string) => Math.round(Date.parse(s + 'T00:00:00Z') / 86_400_000);

describe('lune nuove (Meeus cap. 49)', () => {
  // Effemeridi pubblicate per il 2026, in UTC — SPEC.md §5.3
  const ATTESE = [
    '2026-01-18', '2026-02-17', '2026-03-19', '2026-04-17',
    '2026-05-16', '2026-06-15', '2026-07-14', '2026-08-12',
    '2026-09-11', '2026-10-10', '2026-11-09', '2026-12-09',
  ];

  it('coincidono entro ±1 giorno con le effemeridi 2026', () => {
    const k0 = Math.round(kFromYear(2026.05));
    const calcolate: string[] = [];
    for (let i = -1; i < 14; i++) {
      const d = jdToDay(newMoonJD(k0 + i), 'UTC');
      const s = iso(d);
      if (s.startsWith('2026')) calcolate.push(s);
    }
    expect(calcolate).toHaveLength(12);
    calcolate.forEach((c, i) => {
      const scarto = Math.abs(dayOf(c) - dayOf(ATTESE[i]));
      expect(scarto, `${c} vs ${ATTESE[i]}`).toBeLessThanOrEqual(1);
    });
  });

  it('cadono esattamente sulle date pubblicate', () => {
    const k0 = Math.round(kFromYear(2026.05));
    const calcolate: string[] = [];
    for (let i = -1; i < 14; i++) {
      const s = iso(jdToDay(newMoonJD(k0 + i), 'UTC'));
      if (s.startsWith('2026')) calcolate.push(s);
    }
    expect(calcolate).toEqual(ATTESE);
  });
});

describe('solstizio d’estate (Meeus cap. 27)', () => {
  it('cade il 21 giugno 2026', () => {
    expect(iso(jdToDay(juneSolsticeJD(2026), 'UTC'))).toBe('2026-06-21');
  });

  it('resta fra il 19 e il 22 giugno per ogni anno 2020-2050', () => {
    for (let y = 2020; y <= 2050; y++) {
      const g = iso(jdToDay(juneSolsticeJD(y), 'UTC')).slice(5);
      expect(['06-19', '06-20', '06-21', '06-22']).toContain(g);
    }
  });
});

describe('anno ellenico 2026 (fuso Europe/Rome)', () => {
  const anno = buildYear(2026, ROMA);

  it('inizia mercoledì 15 luglio 2026', () => {
    expect(iso(anno.start)).toBe('2026-07-15');
    expect(weekday(anno.start)).toBe(2);            // 0 = lunedì → 2 = mercoledì
  });

  it('ha 12 mesi e non è intercalare', () => {
    expect(anno.months).toHaveLength(12);
    expect(anno.intercalary).toBe(false);
    expect(anno.months.map((m) => m.name)).toEqual(MONTH_NAMES);
  });

  it('il 28 luglio 2026 è Hekatombaiṓn 14', () => {
    const l = locate(dayOf('2026-07-28'), ROMA);
    expect(l.month.name).toBe('Hekatombaiṓn');
    expect(l.day).toBe(14);
  });
});

describe('integrità dei mesi', () => {
  it('ogni mese dura 29 o 30 giorni, dal 2020 al 2050', () => {
    for (let y = 2020; y <= 2050; y++) {
      for (const m of buildYear(y, ROMA).months) {
        expect([29, 30], `${y} ${m.name} = ${m.length}`).toContain(m.length);
      }
    }
  });

  it('non ci sono buchi né sovrapposizioni fra mesi consecutivi', () => {
    for (let y = 2020; y <= 2050; y++) {
      const anno = buildYear(y, ROMA);
      for (let i = 1; i < anno.months.length; i++) {
        const prima = anno.months[i - 1];
        expect(prima.start + prima.length).toBe(anno.months[i].start);
      }
      // e la giunzione con l'anno seguente
      const ultimo = anno.months[anno.months.length - 1];
      expect(ultimo.start + ultimo.length).toBe(buildYear(y + 1, ROMA).start);
    }
  });

  it('gli anni hanno 12 o 13 mesi; gli intercalari inseriscono Poseideṓn deúteros', () => {
    let intercalari = 0;
    for (let y = 2020; y <= 2050; y++) {
      const anno = buildYear(y, ROMA);
      expect([12, 13]).toContain(anno.months.length);
      if (anno.intercalary) {
        intercalari++;
        expect(anno.months[6].name).toBe('Poseideṓn deúteros');
        expect(anno.months).toHaveLength(13);
      }
    }
    // Un calendario lunisolare intercala circa 7 anni ogni 19.
    expect(intercalari).toBeGreaterThanOrEqual(9);
    expect(intercalari).toBeLessThanOrEqual(13);
  });

  it('ogni giorno dell’anno è coperto da uno e un solo mese', () => {
    const anno = buildYear(2026, ROMA);
    const fine = anno.months[anno.months.length - 1];
    for (let d = anno.start; d < fine.start + fine.length; d++) {
      const l = locate(d, ROMA);
      expect(l.day).toBeGreaterThanOrEqual(1);
      expect(l.day).toBeLessThanOrEqual(l.month.length);
      expect(d).toBe(l.month.start + l.day - 1);
    }
  });
});

describe('dipendenza dal fuso orario', () => {
  it('un fuso americano può dare una data ellenica diversa', () => {
    // Cerca nel 2026 un giorno in cui Roma e New York non concordano:
    // succede quando la congiunzione cade a cavallo della mezzanotte locale.
    const anno = buildYear(2026, ROMA);
    let differenze = 0;
    for (let d = anno.start; d < anno.start + 360; d++) {
      const r = locate(d, ROMA), n = locate(d, NEW_YORK);
      if (r.day !== n.day || r.month.name !== n.month.name) differenze++;
    }
    expect(differenze).toBeGreaterThan(0);
  });

  it('entrambi i fusi restano internamente coerenti', () => {
    for (const tz of [ROMA, NEW_YORK]) {
      const anno = buildYear(2026, tz);
      for (const m of anno.months) expect([29, 30]).toContain(m.length);
      for (let i = 1; i < anno.months.length; i++) {
        expect(anno.months[i - 1].start + anno.months[i - 1].length).toBe(anno.months[i].start);
      }
    }
  });

  it('today() rispetta il fuso richiesto', () => {
    // Mezzanotte e mezza a Roma = ancora il giorno prima a New York.
    const istante = new Date('2026-07-28T22:30:00Z');   // 00:30 del 29 a Roma
    expect(iso(today(istante, ROMA))).toBe('2026-07-29');
    expect(iso(today(istante, NEW_YORK))).toBe('2026-07-28');
  });
});

describe('navigazione fra i mesi', () => {
  it('avanti e indietro attraversa il confine d’anno senza saltare nulla', () => {
    const anno = buildYear(2026, ROMA);
    let m = anno.months[0];
    const visti = [m.start];
    for (let i = 0; i < 26; i++) {
      m = shiftMonth(m, +1, ROMA);
      visti.push(m.start);
    }
    for (let i = 1; i < visti.length; i++) {
      const gap = visti[i] - visti[i - 1];
      expect([29, 30], `salto di ${gap} giorni`).toContain(gap);
    }
    // tornando indietro si ripercorrono le stesse Noumeníe
    for (let i = visti.length - 1; i > 0; i--) {
      m = shiftMonth(m, -1, ROMA);
      expect(m.start).toBe(visti[i - 1]);
    }
  });
});

describe('fase lunare', () => {
  it('è vicina a 0 alla congiunzione e a 0.5 alla luna piena', () => {
    // k dev'essere intero: solo i valori interi corrispondono a congiunzioni reali.
    const nuova = new Date((newMoonJD(Math.round(kFromYear(2026.55))) - 2440587.5) * 86_400_000);
    expect(Math.min(moonPhase(nuova), 1 - moonPhase(nuova))).toBeLessThan(0.01);

    const piena = new Date(nuova.getTime() + 14.765 * 86_400_000);
    expect(Math.abs(moonPhase(piena) - 0.5)).toBeLessThan(0.02);
  });

  it('resta sempre fra 0 e 1', () => {
    for (let i = 0; i < 400; i += 7) {
      const d = new Date(Date.UTC(2026, 0, 1) + i * 86_400_000);
      const p = moonPhase(d);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThan(1);
    }
  });
});
