import { content } from '../data/content';
import { locate, type Day } from './calendar/athenian';
import type { Lang } from '../lang';

/**
 * Il buongiorno e la buonanotte.
 *
 * Le frasi NON sono inventate: sono le invocazioni già presenti nel Grimorio,
 * verificate sulle fonti. Qui si sceglie soltanto quale dio ha senso per quel
 * momento e per quel giorno — alla Noumenía il mattino è di Selene e Apollo,
 * al Deîpnon la sera è di Ecate — seguendo il rito dell'Offerta quotidiana:
 * «al mattino saluta Estia e Helios che sorge; alla sera chiudi con Estia».
 *
 * Funzione pura: gira identica nel browser e sul servizio che invia le
 * notifiche.
 */

export type Momento = 'mattino' | 'sera';

const SALUTI = {
  it: {
    mattino: (n: string) => (n ? `Buongiorno, ${n}` : 'Buongiorno'),
    sera: (n: string) => (n ? `Buonanotte, ${n}` : 'Buonanotte'),
    festa: (n: string) => `Oggi è ${n}`,
  },
  en: {
    mattino: (n: string) => (n ? `Good morning, ${n}` : 'Good morning'),
    sera: (n: string) => (n ? `Good night, ${n}` : 'Good night'),
    festa: (n: string) => `Today is ${n}`,
  },
};

/**
 * Dèi da cui attingere quando il giorno non ne indica uno suo.
 * Solo Olimpi, perché nel Grimorio l'invocazione ce l'hanno soltanto loro:
 * il mattino apre (luce, lavoro, strade), la sera chiude (focolare, luna,
 * affetti, trasformazione).
 */
const MATTINO = ['apollo', 'atena', 'ermes', 'demetra', 'zeus', 'estia'];
const SERA    = ['estia', 'artemide', 'afrodite', 'dioniso', 'era', 'ade'];

export interface Benedizione {
  titolo: string;
  testo: string;
  /** id del dio o del rito da cui viene la frase */
  fonte: string;
}

/**
 * Sceglie la benedizione per un momento e un giorno.
 * La rotazione dipende dal giorno lunare: cambia ogni giorno, ma è
 * riproducibile — la stessa data dà sempre la stessa frase.
 */
export function benedizione(
  momento: Momento,
  civil: Day,
  lang: Lang,
  nome = '',
): Benedizione {
  const c = content(lang);
  const S = SALUTI[lang];
  const oggi = locate(civil);
  const giorno = oggi.day;

  const sacro = c.sacredDay(giorno, oggi.month.length);
  const festa = c.festivalOn(oggi.month.name, giorno);

  /** Preferisce gli dèi del giorno, se ne hanno una da dire. */
  const conInvocazione = (ids: string[]) =>
    ids.map((id) => c.byId(id)).filter((d) => d?.inno);

  const rito = (id: string) => c.RITES.find((r) => r.id === id);
  const daRito = (id: string): Benedizione | null => {
    const r = rito(id);
    return r?.inno ? { titolo: festa ? S.festa(festa.n) : S[momento](nome), testo: r.inno, fonte: r.id } : null;
  };

  /**
   * Il mattino onora il dio del giorno; la sera invece CHIUDE, e attinge al
   * proprio gruppo. Così le due notifiche non ripetono mai la stessa frase:
   * senza questa distinzione, nei giorni con una dedica il buongiorno e la
   * buonanotte sarebbero identici.
   */
  let scelti = momento === 'mattino'
    ? conInvocazione(sacro?.gods ?? [])
    : [];
  if (momento === 'mattino' && !scelti.length) scelti = conInvocazione(festa?.gods ?? []);

  /**
   * Se gli dèi del giorno non hanno un'invocazione propria — nel Grimorio ce
   * l'hanno soltanto i quattordici Olimpi, quindi né Ecate al Deîpnon né
   * Agathòs Daímōn il giorno 2 — si usa il rito che riguarda proprio quei
   * cardini del mese: la triade lunare.
   */
  if (!scelti.length && (oggi.isDeipnon || oggi.isNoumenia || giorno === 2)) {
    const b = daRito('la-triade-lunare');
    if (b) return b;
  }

  if (!scelti.length) {
    const pool = momento === 'mattino' ? MATTINO : SERA;
    scelti = conInvocazione(pool);
    // La sera evita di ripetere il dio già usato al mattino.
    if (momento === 'sera' && scelti.length > 1) {
      const alMattino = benedizione('mattino', civil, lang, nome).fonte;
      const senza = scelti.filter((d) => d!.id !== alMattino);
      if (senza.length) scelti = senza;
    }
  }

  // Nessuna invocazione disponibile: si ripiega sul rito del momento.
  if (!scelti.length) {
    return daRito(momento === 'mattino' ? 'offerta-quotidiana' : 'estia-prima-e-ultima')
      ?? { titolo: S[momento](nome), testo: '', fonte: 'nessuna' };
  }

  const dio = scelti[giorno % scelti.length]!;
  const titolo = festa ? S.festa(festa.n) : S[momento](nome);

  return { titolo, testo: dio.inno!, fonte: dio.id };
}

/** Riassunto di ciò che rende speciale un giorno, o null se è ordinario. */
export function eventiDelGiorno(civil: Day, lang: Lang): string | null {
  const c = content(lang);
  const oggi = locate(civil);
  const parti: string[] = [];

  const festa = c.festivalOn(oggi.month.name, oggi.day);
  if (festa) parti.push(festa.n);

  if (oggi.isNoumenia) parti.push('Noumenía');
  else if (oggi.isDeipnon) parti.push('Deîpnon');
  else {
    const sacro = c.sacredDay(oggi.day, oggi.month.length);
    if (sacro) parti.push(sacro.gods.map(c.nameOf).join(', '));
  }

  return parti.length ? parti.join(' · ') : null;
}
