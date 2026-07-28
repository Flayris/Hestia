import { openDB, type IDBPDatabase } from 'idb';

/**
 * Persistenza su IndexedDB — SPEC.md §8.
 *
 * Il diario è l'unica cosa insostituibile dell'app: tutto il resto (dèi, feste,
 * riti) è nel bundle e si riscarica, ma ciò che hai scritto no. IndexedDB regge
 * molti più dati di localStorage e su iOS è meno esposto alla pulizia
 * automatica — meno, non immune: per questo esiste anche il backup.
 *
 * Alla prima apertura i dati salvati in localStorage vengono travasati qui.
 */

const NOME = 'hestia';
const VERSIONE = 1;

export type Store = 'diary' | 'prefs';

let db: Promise<IDBPDatabase> | null = null;

function apri() {
  if (!db) {
    db = openDB(NOME, VERSIONE, {
      upgrade(d) {
        if (!d.objectStoreNames.contains('diary')) d.createObjectStore('diary', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('prefs')) d.createObjectStore('prefs');
      },
    });
  }
  return db;
}

export interface DiaryEntry {
  id: string;
  hellenicDate: string;
  gregorian: string;
  text: string;
  mood: number | null;
  ts: number;
}

/* -------------------------------- diario -------------------------------- */

export async function tutteLeVoci(): Promise<DiaryEntry[]> {
  const voci = await (await apri()).getAll('diary');
  return (voci as DiaryEntry[]).sort((a, b) => b.ts - a.ts);
}

export async function salvaVoce(e: DiaryEntry) {
  await (await apri()).put('diary', e);
}

export async function eliminaVoce(id: string) {
  await (await apri()).delete('diary', id);
}

/* ------------------------------ preferenze ------------------------------- */

export async function leggiPref<T>(chiave: string, fallback: T): Promise<T> {
  const v = await (await apri()).get('prefs', chiave);
  return v === undefined ? fallback : (v as T);
}

export async function scriviPref<T>(chiave: string, valore: T) {
  await (await apri()).put('prefs', valore, chiave);
}

/* ------------------------------- migrazione ------------------------------ */

/** Travasa i dati da localStorage una sola volta, poi segna il travaso fatto. */
export async function migraDaLocalStorage() {
  if (await leggiPref('migrato', false)) return;

  const leggi = (k: string) => {
    try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : null; } catch { return null; }
  };

  const diario = leggi('hestia.diary');
  if (Array.isArray(diario)) for (const v of diario) await salvaVoce(v as DiaryEntry);

  for (const [vecchia, nuova] of [['hestia.myGods', 'myGods'], ['hestia.dismissed', 'dismissed']]) {
    const v = leggi(vecchia);
    if (v !== null) await scriviPref(nuova, v);
  }

  await scriviPref('migrato', true);
}

/* -------------------------------- backup --------------------------------- */

export interface Backup {
  app: 'hestia';
  versione: number;
  esportatoIl: string;
  diary: DiaryEntry[];
  myGods: string[];
}

export async function esporta(): Promise<Backup> {
  return {
    app: 'hestia',
    versione: VERSIONE,
    esportatoIl: new Date().toISOString(),
    diary: await tutteLeVoci(),
    myGods: await leggiPref<string[]>('myGods', []),
  };
}

export interface EsitoImport { aggiunte: number; giaPresenti: number; }

export interface Fusione extends EsitoImport {
  daAggiungere: DiaryEntry[];
  myGods: string[] | null;
}

/**
 * Decide cosa aggiungere, senza toccare niente. Funzione pura, testata:
 * è la garanzia che un import NON possa distruggere il diario.
 *
 * Regole: le voci con un id già presente vengono saltate, mai sovrascritte;
 * le voci malformate vengono ignorate; nulla viene mai rimosso.
 */
export function fondiBackup(esistenti: DiaryEntry[], dati: unknown): Fusione {
  const b = dati as Partial<Backup>;
  if (!b || b.app !== 'hestia' || !Array.isArray(b.diary)) {
    throw new Error('Non sembra un backup di Hestía.');
  }

  const noti = new Set(esistenti.map((v) => v.id));
  const daAggiungere: DiaryEntry[] = [];
  let giaPresenti = 0;

  for (const v of b.diary) {
    if (!v?.id || typeof v.text !== 'string') continue;   // malformata: si ignora
    if (noti.has(v.id)) { giaPresenti++; continue; }      // già presente: non si tocca
    noti.add(v.id);                                       // e nemmeno due volte nello stesso file
    daAggiungere.push(v);
  }

  return {
    daAggiungere,
    aggiunte: daAggiungere.length,
    giaPresenti,
    myGods: Array.isArray(b.myGods) ? b.myGods : null,
  };
}

/** Applica la fusione a IndexedDB. */
export async function importa(dati: unknown): Promise<EsitoImport> {
  const f = fondiBackup(await tutteLeVoci(), dati);

  for (const v of f.daAggiungere) await salvaVoce(v);

  if (f.myGods) {
    const attuali = await leggiPref<string[]>('myGods', []);
    await scriviPref('myGods', [...new Set([...attuali, ...f.myGods])]);
  }

  return { aggiunte: f.aggiunte, giaPresenti: f.giaPresenti };
}
