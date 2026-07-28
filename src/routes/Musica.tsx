import { useNavigate } from 'react-router-dom';
import { Card, Label, Chip } from '../components/ui';
import { MUSIC } from '../data/content';

export function Musica() {
  const nav = useNavigate();
  return (
    <main className="screen">
      <header className="appbar app-chrome">
        <div>
          <button className="chip" onClick={() => nav('/')}>← Oggi</button>
          <h1 className="t-screen" style={{ marginTop: 8 }}>Musica</h1>
        </div>
      </header>

      <div className="stack">
        <Card>
          <Label>Per la pratica</Label>
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
                <span className="t-card" style={{ display: 'block' }}>{m.t}</span>
                <span className="t-second">{m.service}</span>
              </span>
              <span className="row-item__chevron">↗</span>
            </a>
          ))}
        </Card>

        <Card>
          <Label>I tuoi link</Label>
          <p className="empty" style={{ padding: 'var(--s4) 0 0' }}>
            Qui potrai salvare le tue playlist. Arriva con M8.
          </p>
        </Card>

        <p className="t-second" style={{ textAlign: 'center', color: 'var(--dim)' }}>
          Solo collegamenti esterni: nessuna musica è contenuta nell’app. <Chip>scelta di design</Chip>
        </p>
      </div>
    </main>
  );
}
