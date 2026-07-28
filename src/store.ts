import { useCallback, useEffect, useState } from 'react';
import {
  tutteLeVoci, salvaVoce, eliminaVoce, leggiPref, scriviPref, migraDaLocalStorage,
  type DiaryEntry,
} from './db';

export type { DiaryEntry };

/**
 * Dati dell'utente su IndexedDB (SPEC.md §8).
 * La migrazione da localStorage avviene una volta sola, al primo avvio.
 */

let migrazione: Promise<void> | null = null;
const pronta = () => (migrazione ??= migraDaLocalStorage());

/** Preferenza persistita, con lettura asincrona all'avvio. */
function usePref<T>(chiave: string, iniziale: T) {
  const [valore, setValore] = useState<T>(iniziale);

  useEffect(() => {
    let vivo = true;
    pronta().then(() => leggiPref<T>(chiave, iniziale)).then((v) => { if (vivo) setValore(v); });
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chiave]);

  const aggiorna = useCallback((f: (v: T) => T) => {
    setValore((cur) => {
      const nuovo = f(cur);
      void scriviPref(chiave, nuovo);
      return nuovo;
    });
  }, [chiave]);

  return [valore, aggiorna] as const;
}

export function useMyGods() {
  const [ids, aggiorna] = usePref<string[]>('myGods', []);
  const has = useCallback((id: string) => ids.includes(id), [ids]);
  const toggle = useCallback(
    (id: string) => aggiorna((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id])),
    [aggiorna],
  );
  return { ids, has, toggle };
}

export function useDismissed() {
  const [ids, aggiorna] = usePref<string[]>('dismissed', []);
  const dismiss = useCallback((id: string) => aggiorna((cur) => [...cur, id]), [aggiorna]);
  const reset = useCallback(() => aggiorna(() => []), [aggiorna]);
  return { ids, dismiss, reset };
}

export function useDiary() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  const ricarica = useCallback(async () => setEntries(await tutteLeVoci()), []);

  useEffect(() => { pronta().then(ricarica); }, [ricarica]);

  const add = useCallback(async (e: Omit<DiaryEntry, 'id' | 'ts'>) => {
    await salvaVoce({ ...e, id: crypto.randomUUID(), ts: Date.now() });
    await ricarica();
  }, [ricarica]);

  const remove = useCallback(async (id: string) => {
    await eliminaVoce(id);
    await ricarica();
  }, [ricarica]);

  return { entries, add, remove, ricarica };
}
