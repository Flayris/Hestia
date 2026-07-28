import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type Theme = 'light' | 'dark';
export type Lang = 'it' | 'en';

export interface Settings {
  theme: Theme;
  lang: Lang;
  name: string;
}

const KEY = 'hestia.settings';

/** Al primo avvio si segue la preferenza del sistema; poi vince la scelta dell'utente. */
function initial(): Settings {
  const prefersDark = typeof matchMedia === 'function'
    && matchMedia('(prefers-color-scheme: dark)').matches;
  const base: Settings = { theme: prefersDark ? 'dark' : 'light', lang: 'it', name: '' };
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...base, ...JSON.parse(raw) } : base;
  } catch {
    return base;
  }
}

const Ctx = createContext<{
  settings: Settings;
  set: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}>({ settings: initial(), set: () => {} });

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(initial);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch { /* quota piena */ }
    document.documentElement.dataset.theme = settings.theme;
    document.documentElement.lang = settings.lang;
  }, [settings]);

  const value = useMemo(() => ({
    settings,
    set: <K extends keyof Settings>(key: K, v: Settings[K]) =>
      setSettings((s) => ({ ...s, [key]: v })),
  }), [settings]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useSettings = () => useContext(Ctx);
