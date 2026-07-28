import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Label, Orb, SegmentedControl } from '../components/ui';
import { BottomSheet } from '../components/BottomSheet';
import { CATEGORIES, DEITIES, RITES, CONCEPTS, FESTIVALS_THIS_MONTH, byId, categoryOf } from '../data/content';
import type { CategoryKey } from '../types';
import { useMyGods } from '../store';

type Tab = 'dei' | 'riti' | 'feste' | 'altro';

const TABS = [
  { value: 'dei' as const, label: 'Dèi' },
  { value: 'riti' as const, label: 'Riti' },
  { value: 'feste' as const, label: 'Feste' },
  { value: 'altro' as const, label: 'Altro' },
];

export function Grimorio() {
  const [tab, setTab] = useState<Tab>('dei');
  const [cat, setCat] = useState<CategoryKey | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [params, setParams] = useSearchParams();

  // Arrivo da un Orb della Home o del Calendario: apre direttamente la scheda.
  useEffect(() => {
    const dio = params.get('dio');
    if (dio && byId(dio)) {
      setTab('dei');
      setOpenId(dio);
      params.delete('dio');
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  return (
    <main className="screen">
      <header className="appbar app-chrome">
        <h1 className="t-screen">Grimorio</h1>
      </header>

      <div className="stack">
        <SegmentedControl options={TABS} value={tab} onChange={(v) => { setTab(v); setCat(null); }} />

        {tab === 'dei' && (cat ? <DeityList cat={cat} onBack={() => setCat(null)} onOpen={setOpenId} />
                                : <CategoryGrid onPick={setCat} />)}

        {tab === 'riti' && <SimpleList items={RITES} />}

        {tab === 'feste' && (
          <Card>
            <Label>Mese in corso · Hekatombaiṓn</Label>
            <div style={{ height: 'var(--s2)' }} />
            {FESTIVALS_THIS_MONTH.map((f) => (
              <div key={f.n} className="row-item">
                <div className="row-item__grow">
                  <p className="t-card">{f.n}</p>
                  <p className="t-second">giorno {f.d} · {f.gods.map((g) => byId(g)?.n ?? g).join(', ')}</p>
                </div>
              </div>
            ))}
            <p className="t-second" style={{ marginTop: 'var(--s4)', color: 'var(--dim)' }}>
              Le 24 feste degli altri mesi arrivano con la conversione dei contenuti (M5).
            </p>
          </Card>
        )}

        {tab === 'altro' && <SimpleList items={CONCEPTS} />}
      </div>

      <DeitySheet id={openId} onClose={() => setOpenId(null)} />
    </main>
  );
}

function CategoryGrid({ onPick }: { onPick: (k: CategoryKey) => void }) {
  return (
    <div className="cat-grid">
      {CATEGORIES.map((c) => (
        <button key={c.key} className="cat-tile" onClick={() => onPick(c.key)}>
          <span className="cat-tile__sym">{c.sym}</span>
          <span className="cat-tile__label">{c.label}</span>
          <span className="cat-tile__desc">{c.desc}</span>
          <span className="cat-tile__count">{c.count} voci</span>
        </button>
      ))}
    </div>
  );
}

function DeityList({ cat, onBack, onOpen }: {
  cat: CategoryKey;
  onBack: () => void;
  onOpen: (id: string) => void;
}) {
  const c = categoryOf(cat);
  const list = DEITIES.filter((d) => d.cats.includes(cat));
  return (
    <>
      <button className="chip" onClick={onBack} style={{ alignSelf: 'flex-start' }}>← categorie</button>
      <Card>
        <Label>{c.label}</Label>
        <div style={{ height: 'var(--s2)' }} />
        {list.map((d) => (
          <button key={d.id} className="row-item" onClick={() => onOpen(d.id)}>
            <Orb name={d.n} size="sm" />
            <span className="row-item__grow">
              <span className="t-card" style={{ display: 'block' }}>{d.n}</span>
              <span className="t-second" style={{ display: 'block' }}>
                <span className="t-greek" lang="grc">{d.gk}</span> · {d.ep}
              </span>
            </span>
            <span className="row-item__chevron">›</span>
          </button>
        ))}
      </Card>
    </>
  );
}

function DeitySheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { has, toggle } = useMyGods();
  const d = id ? byId(id) : undefined;

  return (
    <BottomSheet open={!!d} onClose={onClose}>
      {d && (
        <div className="stack">
          <div className="row--between">
            <div className="row">
              <Orb name={d.n} />
              <div>
                <h2 className="t-section">{d.n}</h2>
                <p className="t-greek" lang="grc" style={{ fontSize: 18 }}>{d.gk}</p>
                <p className="t-label">{d.ep}</p>
              </div>
            </div>
            <button
              className="star"
              onClick={() => toggle(d.id)}
              aria-pressed={has(d.id)}
              aria-label={has(d.id) ? `Togli ${d.n} dai tuoi dèi` : `Aggiungi ${d.n} ai tuoi dèi`}
            >
              {has(d.id) ? '★' : '☆'}
            </button>
          </div>

          <div className="wrap">
            {d.cats.map((k) => <span key={k} className="chip">{categoryOf(k).label}</span>)}
          </div>

          <hr className="divider" />

          <p className="t-second" style={{ color: 'var(--dim)' }}>
            Introduzione narrativa, Domini, Simboli, Offerte, Allora, Oggi puoi, Invocazione
            e link alla fonte sono già scritti in
            <code style={{ fontSize: 13 }}> _input/Hestia - Grimorio completo_1.md</code> e
            compaiono qui con la conversione dei contenuti (M5).
          </p>
        </div>
      )}
    </BottomSheet>
  );
}

function SimpleList({ items }: { items: { n: string; sub: string }[] }) {
  return (
    <Card>
      {items.map((r) => (
        <div key={r.n} className="row-item">
          <div className="row-item__grow">
            <p className="t-card">{r.n}</p>
            <p className="t-second">{r.sub}</p>
          </div>
        </div>
      ))}
      <p className="t-second" style={{ marginTop: 'var(--s4)', color: 'var(--dim)' }}>
        Testi completi Allora / Oggi puoi in arrivo con M5.
      </p>
    </Card>
  );
}
