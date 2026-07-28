import { useCallback, useEffect, useState } from 'react';

/**
 * Persistenza provvisoria su localStorage.
 * In M6 passa a IndexedDB (SPEC.md §8) mantenendo la stessa interfaccia.
 */

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function usePersisted<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => read(key, initial));
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota piena */ }
  }, [key, value]);
  return [value, setValue] as const;
}

export function useMyGods() {
  const [ids, setIds] = usePersisted<string[]>('hestia.myGods', []);
  const has = useCallback((id: string) => ids.includes(id), [ids]);
  const toggle = useCallback(
    (id: string) => setIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id])),
    [setIds],
  );
  return { ids, has, toggle };
}

export function useDismissed() {
  const [ids, setIds] = usePersisted<string[]>('hestia.dismissed', []);
  const dismiss = useCallback((id: string) => setIds((cur) => [...cur, id]), [setIds]);
  const reset = useCallback(() => setIds([]), [setIds]);
  return { ids, dismiss, reset };
}

export interface DiaryEntry {
  id: string;
  hellenicDate: string;
  gregorian: string;
  text: string;
  mood: number | null;
  ts: number;
}

export function useDiary() {
  const [entries, setEntries] = usePersisted<DiaryEntry[]>('hestia.diary', []);
  const add = useCallback(
    (e: Omit<DiaryEntry, 'id' | 'ts'>) =>
      setEntries((cur) => [{ ...e, id: crypto.randomUUID(), ts: Date.now() }, ...cur]),
    [setEntries],
  );
  const remove = useCallback(
    (id: string) => setEntries((cur) => cur.filter((e) => e.id !== id)),
    [setEntries],
  );
  return { entries, add, remove };
}
