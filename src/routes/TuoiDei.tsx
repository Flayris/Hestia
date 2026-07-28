import { useNavigate } from 'react-router-dom';
import { Card, Label, Orb } from '../components/ui';
import { CATEGORIES, deitiesOf } from '../data/content';
import { useMyGods } from '../store';

export function TuoiDei() {
  const nav = useNavigate();
  const { ids, has, toggle } = useMyGods();

  return (
    <main className="screen">
      <header className="appbar app-chrome">
        <div>
          <button className="chip" onClick={() => nav('/')}>← Oggi</button>
          <h1 className="t-screen" style={{ marginTop: 8 }}>I tuoi dèi</h1>
          <p className="t-second">
            {ids.length === 0
              ? 'Nessuno scelto: i selezionati si evidenziano nel calendario.'
              : `${ids.length} scelti`}
          </p>
        </div>
      </header>

      <div className="stack">
        {CATEGORIES.map((c) => {
          const list = deitiesOf(c.key);
          return (
            <Card key={c.key}>
              <Label>{c.sym} {c.label}</Label>
              <div style={{ height: 'var(--s2)' }} />
              {list.map((d) => (
                <button key={d.id} className="row-item" onClick={() => toggle(d.id)}>
                  <Orb name={d.n} size="sm" />
                  <span className="row-item__grow">
                    <span className="t-card" style={{ display: 'block' }}>{d.n}</span>
                    <span className="t-second">{d.ep}</span>
                  </span>
                  <span className="star" aria-hidden="true">{has(d.id) ? '★' : '☆'}</span>
                </button>
              ))}
            </Card>
          );
        })}
      </div>
    </main>
  );
}
