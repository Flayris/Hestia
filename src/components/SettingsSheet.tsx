import { BottomSheet } from './BottomSheet';
import { SegmentedControl, Label } from './ui';
import { useSettings, type Theme, type Lang } from '../settings';
import { useT } from '../useT';
import { useContent } from '../data/useContent';

export function SettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { settings, set } = useSettings();
  const t = useT();
  // I 14 Dèi Olimpi, presi dal Grimorio nella lingua in uso.
  const olimpi = useContent().deitiesOf('olimpi');

  return (
    <BottomSheet open={open} onClose={onClose} title={t.settings}>
      <div className="stack">
        <div>
          <Label>{t.appearance}</Label>
          <div style={{ marginTop: 'var(--s2)' }}>
            <SegmentedControl<Theme>
              options={[
                { value: 'light', label: `☀ ${t.light}` },
                { value: 'dark', label: `☾ ${t.dark}` },
              ]}
              value={settings.theme}
              onChange={(v) => set('theme', v)}
            />
          </div>
        </div>

        <div>
          <Label>{t.language}</Label>
          <div style={{ marginTop: 'var(--s2)' }}>
            <SegmentedControl<Lang>
              options={[
                { value: 'it', label: t.italian },
                { value: 'en', label: t.english },
              ]}
              value={settings.lang}
              onChange={(v) => set('lang', v)}
            />
          </div>
        </div>

        <div>
          <Label>{t.deityTheme}</Label>
          <select
            className="field"
            style={{ marginTop: 'var(--s2)' }}
            value={settings.deity}
            onChange={(e) => set('deity', e.target.value)}
          >
            <option value="">{t.defaultTheme}</option>
            {olimpi.map((d) => (
              <option key={d.id} value={d.id}>{d.n}</option>
            ))}
          </select>
        </div>

        <div>
          <Label>{t.yourName}</Label>
          <input
            className="field"
            style={{ marginTop: 'var(--s2)' }}
            value={settings.name}
            placeholder={t.namePlaceholder}
            onChange={(e) => set('name', e.target.value)}
            maxLength={24}
          />
        </div>
      </div>
    </BottomSheet>
  );
}

/** Icona che apre le impostazioni: sole o luna, secondo il tema in uso. */
export function SettingsButton({ onClick }: { onClick: () => void }) {
  const { settings } = useSettings();
  const t = useT();
  const dark = settings.theme === 'dark';

  return (
    <button className="icon-btn" onClick={onClick} aria-label={t.settings}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {dark
          ? <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="currentColor" stroke="none" />
          : (
            <>
              <circle cx="12" cy="12" r="4.2" fill="currentColor" stroke="none" />
              <path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.3 5.3l1.5 1.5M17.2 17.2l1.5 1.5M18.7 5.3l-1.5 1.5M6.8 17.2l-1.5 1.5" />
            </>
          )}
      </svg>
    </button>
  );
}
