import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Label, Orb, SegmentedControl } from '../components/ui';
import { BottomSheet } from '../components/BottomSheet';
import { Block, TextBlock, ListBlock, Invocation, Source } from '../components/Sections';
import {
  CATEGORIES, RITES, CONCEPTS, FESTIVALS, MONTHS,
  byId, nameOf, categoryOf, deitiesOf,
} from '../data/content';
import type { CategoryKey, Festival, Rite, Concept } from '../types';
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
  const [deityId, setDeityId] = useState<string | null>(null);
  const [rite, setRite] = useState<Rite | Concept | null>(null);
  const [fest, setFest] = useState<{ month: string; f: Festival } | null>(null);
  const [params, setParams] = useSearchParams();

  // Arrivo da un Orb della Home o del Calendario: apre direttamente la scheda.
  useEffect(() => {
    const dio = params.get('dio');
    if (dio && byId(dio)) {
      setTab('dei');
      setDeityId(dio);
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

        {tab === 'dei' && (cat
          ? <DeityList cat={cat} onBack={() => setCat(null)} onOpen={setDeityId} />
          : <CategoryGrid onPick={setCat} />)}

        {tab === 'riti' && <RiteList items={RITES} onOpen={setRite} />}
        {tab === 'altro' && <RiteList items={CONCEPTS} onOpen={setRite} />}
        {tab === 'feste' && <FestivalList onOpen={(month, f) => setFest({ month, f })} />}
      </div>

      <DeitySheet id={deityId} onClose={() => setDeityId(null)} />
      <RiteSheet item={rite} onClose={() => setRite(null)} />
      <FestivalSheet data={fest} onClose={() => setFest(null)} onDeity={setDeityId} />
    </main>
  );
}

/* --------------------------------- dèi --------------------------------- */

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
  cat: CategoryKey; onBack: () => void; onOpen: (id: string) => void;
}) {
  const c = categoryOf(cat);
  return (
    <>
      <button className="chip" onClick={onBack} style={{ alignSelf: 'flex-start' }}>← categorie</button>
      <Card>
        <Label>{c.label}</Label>
        <div style={{ height: 'var(--s2)' }} />
        {deitiesOf(cat).map((d) => (
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
    <BottomSheet open={!!d} onClose={onClose} title={d?.n}>
      {d && (
        <div className="stack">
          <div className="sheet-head" style={{ marginTop: -8 }}>
            <div className="row">
              <Orb name={d.n} />
              <div>
                <p className="t-greek" lang="grc" style={{ fontSize: 20 }}>{d.gk}</p>
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

          <p className="t-prose">{d.intro}</p>

          <ListBlock title="Domini" items={d.dom} />
          <ListBlock title="Simboli e attributi" items={d.sim} />
          <ListBlock title="Offerte" items={d.off} />

          <hr className="divider" />

          <TextBlock title="Nell'antichità" text={d.allora} />
          <TextBlock title="Oggi puoi" text={d.adesso} />
          <Invocation text={d.inno} />

          <div className="wrap" style={{ marginTop: 'var(--s2)' }}>
            {d.cats.map((k) => <span key={k} className="chip">{categoryOf(k).label}</span>)}
          </div>
          <Source url={d.src} />
        </div>
      )}
    </BottomSheet>
  );
}

/* --------------------------- riti e concetti --------------------------- */

function RiteList({ items, onOpen }: {
  items: (Rite | Concept)[]; onOpen: (r: Rite | Concept) => void;
}) {
  return (
    <Card>
      {items.map((r) => (
        <button key={r.id} className="row-item" onClick={() => onOpen(r)}>
          <span className="row-item__grow">
            <span className="t-card" style={{ display: 'block' }}>{r.n}</span>
            <span className="t-second">{r.sub}</span>
          </span>
          <span className="row-item__chevron">›</span>
        </button>
      ))}
    </Card>
  );
}

function RiteSheet({ item, onClose }: { item: Rite | Concept | null; onClose: () => void }) {
  const inno = item && 'inno' in item ? item.inno : undefined;
  return (
    <BottomSheet open={!!item} onClose={onClose} title={item?.n}>
      {item && (
        <div className="stack">
          <p className="t-label" style={{ marginTop: -8 }}>{item.sub}</p>
          <p className="t-prose">{item.cos}</p>
          <hr className="divider" />
          <TextBlock title="Nell'antichità" text={item.allora} />
          <TextBlock title="Oggi puoi" text={item.adesso} />
          <Invocation text={inno} title="Formula da pronunciare" />
        </div>
      )}
    </BottomSheet>
  );
}

/* --------------------------------- feste -------------------------------- */

function FestivalList({ onOpen }: { onOpen: (month: string, f: Festival) => void }) {
  return (
    <div className="stack">
      {MONTHS.map((month, i) => (
        <Card key={month}>
          <div className="month-title">
            <span className="month-title__n">{month}</span>
            <span className="month-title__i">mese {i + 1}</span>
          </div>
          {(FESTIVALS[month] ?? []).map((f) => (
            <button key={f.n} className="row-item" onClick={() => onOpen(month, f)}>
              <span className="day-badge">{f.d}</span>
              <span className="row-item__grow">
                <span className="t-card" style={{ display: 'block' }}>{f.n}</span>
                <span className="t-second">{f.gods.map(nameOf).join(', ')}</span>
              </span>
              <span className="row-item__chevron">›</span>
            </button>
          ))}
        </Card>
      ))}
    </div>
  );
}

function FestivalSheet({ data, onClose, onDeity }: {
  data: { month: string; f: Festival } | null;
  onClose: () => void;
  onDeity: (id: string) => void;
}) {
  return (
    <BottomSheet open={!!data} onClose={onClose} title={data?.f.n}>
      {data && (
        <div className="stack">
          <p className="t-label" style={{ marginTop: -8 }}>{data.month} {data.f.d}</p>
          <p className="t-prose">{data.f.cos}</p>
          <hr className="divider" />
          <TextBlock title="Nell'antichità" text={data.f.allora} />
          <TextBlock title="Oggi puoi" text={data.f.adesso} />
          {data.f.gods.length > 0 && (
            <Block title="Dèi onorati">
              <div className="wrap" style={{ marginTop: 'var(--s2)' }}>
                {data.f.gods.map((id) => (
                  <button key={id} className="chip" onClick={() => { onClose(); onDeity(id); }}>
                    {nameOf(id)} ›
                  </button>
                ))}
              </div>
            </Block>
          )}
        </div>
      )}
    </BottomSheet>
  );
}
