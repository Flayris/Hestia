import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Label, Orb, SegmentedControl } from '../components/ui';
import { BottomSheet } from '../components/BottomSheet';
import { Block, TextBlock, ListBlock, Invocation, Source } from '../components/Sections';
import { MONTHS } from '../data/content';
import { useContent } from '../data/useContent';
import type { CategoryKey, Festival, Rite, Concept } from '../types';
import { useMyGods } from '../store';
import { useT } from '../useT';

type Tab = 'dei' | 'riti' | 'feste' | 'altro';

export function Grimorio() {
  const t = useT();
  const { RITES, CONCEPTS, byId } = useContent();
  const TABS = [
    { value: 'dei' as const, label: t.tabGods },
    { value: 'riti' as const, label: t.tabRites },
    { value: 'feste' as const, label: t.tabFestivals },
    { value: 'altro' as const, label: t.tabOther },
  ];
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
        <h1 className="t-screen">{t.grimoire}</h1>
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
  const t = useT();
  const { CATEGORIES } = useContent();
  return (
    <div className="cat-grid">
      {CATEGORIES.map((c) => (
        <button key={c.key} className="cat-tile" onClick={() => onPick(c.key)}>
          <span className="cat-tile__sym">{c.sym}</span>
          <span className="cat-tile__label">{t.cat[c.key][0]}</span>
          <span className="cat-tile__desc">{t.cat[c.key][1]}</span>
          <span className="cat-tile__count">{t.entries(c.count)}</span>
        </button>
      ))}
    </div>
  );
}

function DeityList({ cat, onBack, onOpen }: {
  cat: CategoryKey; onBack: () => void; onOpen: (id: string) => void;
}) {
  const t = useT();
  const { deitiesOf } = useContent();
  return (
    <>
      <button className="chip" onClick={onBack} style={{ alignSelf: 'flex-start' }}>{t.backToCategories}</button>
      <Card>
        <Label>{t.cat[cat][0]}</Label>
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
  const t = useT();
  const { byId } = useContent();
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
              aria-label={has(d.id) ? t.removeFromYours(d.n) : t.addToYours(d.n)}
            >
              {has(d.id) ? '★' : '☆'}
            </button>
          </div>

          <p className="t-prose">{d.intro}</p>

          <ListBlock title={t.domains} items={d.dom} />
          <ListBlock title={t.symbols} items={d.sim} />
          <ListBlock title={t.offerings} items={d.off} />

          <hr className="divider" />

          <TextBlock title={t.backThen} text={d.allora} />
          <TextBlock title={t.nowYouCan} text={d.adesso} />
          <Invocation text={d.inno} />

          <div className="wrap" style={{ marginTop: 'var(--s2)' }}>
            {d.cats.map((k) => <span key={k} className="chip">{t.cat[k][0]}</span>)}
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
  const t = useT();
  const inno = item && 'inno' in item ? item.inno : undefined;
  return (
    <BottomSheet open={!!item} onClose={onClose} title={item?.n}>
      {item && (
        <div className="stack">
          <p className="t-label" style={{ marginTop: -8 }}>{item.sub}</p>
          <p className="t-prose">{item.cos}</p>
          <hr className="divider" />
          <TextBlock title={t.backThen} text={item.allora} />
          <TextBlock title={t.nowYouCan} text={item.adesso} />
          <Invocation text={inno} title={t.formula} />
        </div>
      )}
    </BottomSheet>
  );
}

/* --------------------------------- feste -------------------------------- */

function FestivalList({ onOpen }: { onOpen: (month: string, f: Festival) => void }) {
  const t = useT();
  const { FESTIVALS, nameOf } = useContent();
  return (
    <div className="stack">
      {MONTHS.map((month, i) => (
        <Card key={month}>
          <div className="month-title">
            <span className="month-title__n">{month}</span>
            <span className="month-title__i">{t.monthN(i + 1)}</span>
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
  const t = useT();
  const { nameOf } = useContent();
  return (
    <BottomSheet open={!!data} onClose={onClose} title={data?.f.n}>
      {data && (
        <div className="stack">
          <p className="t-label" style={{ marginTop: -8 }}>{data.month} {data.f.d}</p>
          <p className="t-prose">{data.f.cos}</p>
          <hr className="divider" />
          <TextBlock title={t.backThen} text={data.f.allora} />
          <TextBlock title={t.nowYouCan} text={data.f.adesso} />
          {data.f.gods.length > 0 && (
            <Block title={t.honouredGods}>
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
