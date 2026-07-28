import { useNavigate } from 'react-router-dom';
import { Card, Label } from '../components/ui';
import { MUSIC } from '../data/content';
import { useT } from '../i18n';
import { useSettings } from '../settings';

export function Musica() {
  const nav = useNavigate();
  const t = useT();
  const { settings } = useSettings();
  return (
    <main className="screen">
      <header className="appbar app-chrome">
        <div>
          <button className="chip" onClick={() => nav('/')}>← {t.tabToday}</button>
          <h1 className="t-screen" style={{ marginTop: 8 }}>{t.music}</h1>
        </div>
      </header>

      <div className="stack">
        <Card>
          <Label>{t.forPractice}</Label>
          <div style={{ height: 'var(--s2)' }} />
          {MUSIC.map((m) => (
            <a
              key={m.t}
              className="row-item"
              href={m.url}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <span className="row-item__grow">
                <span className="t-card" style={{ display: 'block' }}>{settings.lang === 'en' ? m.tEn : m.t}</span>
                <span className="t-second">{m.service}</span>
              </span>
              <span className="row-item__chevron">↗</span>
            </a>
          ))}
        </Card>

        <p className="t-second" style={{ textAlign: 'center', color: 'var(--dim)' }}>
          {t.musicNote}
        </p>
      </div>
    </main>
  );
}
