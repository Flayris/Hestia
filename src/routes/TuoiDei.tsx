import { useNavigate } from 'react-router-dom';
import { Card, Label, Orb } from '../components/ui';
import { useContent } from '../data/content';
import { useT } from '../i18n';
import { useMyGods } from '../store';

export function TuoiDei() {
  const nav = useNavigate();
  const { ids, has, toggle } = useMyGods();
  const t = useT();
  const { CATEGORIES, deitiesOf } = useContent();

  return (
    <main className="screen">
      <header className="appbar app-chrome">
        <div>
          <button className="chip" onClick={() => nav('/')}>← {t.tabToday}</button>
          <h1 className="t-screen" style={{ marginTop: 8 }}>{t.yourGods}</h1>
          <p className="t-second">
            {ids.length === 0
              ? t.noneChosen
              : t.chosen(ids.length)}
          </p>
        </div>
      </header>

      <div className="stack">
        {CATEGORIES.map((c) => {
          const list = deitiesOf(c.key);
          return (
            <Card key={c.key}>
              <Label>{c.sym} {t.cat[c.key][0]}</Label>
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
