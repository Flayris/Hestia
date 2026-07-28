import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Label, OrbItem } from '../components/ui';
import { BottomSheet } from '../components/BottomSheet';
import { TextBlock } from '../components/Sections';
import {
  dataEllenica, shiftMonth, weekday, gregorianoBreve, gregorianoEsteso, etichettaAnno,
  type HellenicMonth,
} from '../lib/calendar';
import { sacredDay, festivalOn, nameOf } from '../data/content';
import { useMyGods } from '../store';

const WEEKDAYS = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];

export function Calendario() {
  const nav = useNavigate();
  const { ids: myGods } = useMyGods();
  const oggi = dataEllenica();

  const [mese, setMese] = useState<HellenicMonth>(oggi.month);
  const [sel, setSel] = useState<number | null>(null);

  const giorni = Array.from({ length: mese.length }, (_, i) => i + 1);
  const primoGiornoSettimana = weekday(mese.start);
  const eMeseCorrente = mese.start === oggi.month.start;

  const selSacred = sel != null ? sacredDay(sel, mese.length) : undefined;
  const selFestival = sel != null ? festivalOn(mese.name, sel) : undefined;
  const selGods = selSacred?.gods ?? selFestival?.gods ?? [];

  return (
    <main className="screen">
      <header className="appbar app-chrome">
        <div style={{ width: '100%' }}>
          <p className="t-label">Calendario ateniese</p>

          <div className="cal-nav">
            <button
              className="cal-nav__btn"
              onClick={() => setMese(shiftMonth(mese, -1))}
              aria-label="Mese precedente"
            >‹</button>

            <div className="cal-nav__title">
              <h1 className="t-screen">{mese.name}</h1>
              <p className="t-second">{etichettaAnno(mese)}</p>
            </div>

            <button
              className="cal-nav__btn"
              onClick={() => setMese(shiftMonth(mese, +1))}
              aria-label="Mese successivo"
            >›</button>
          </div>

          {!eMeseCorrente && (
            <button className="chip" onClick={() => setMese(oggi.month)} style={{ marginTop: 'var(--s2)' }}>
              ↩ torna a oggi
            </button>
          )}
          {mese.intercalary && (
            <p className="t-second" style={{ marginTop: 'var(--s2)', color: 'var(--terra)' }}>
              Mese intercalare: quest’anno ellenico ha 13 lunazioni.
            </p>
          )}
        </div>
      </header>

      <div className="stack">
        <Card>
          <div className="cal-head">
            {WEEKDAYS.map((d, i) => <span key={i}>{d}</span>)}
          </div>

          <div className="cal-grid">
            {Array.from({ length: primoGiornoSettimana }, (_, i) => <span key={`pad-${i}`} />)}

            {giorni.map((d) => {
              const civil = mese.start + d - 1;
              const sacred = sacredDay(d, mese.length);
              const fest = festivalOn(mese.name, d);
              const mine = (sacred?.gods ?? fest?.gods ?? []).some((id) => myGods.includes(id));
              const isToday = civil === oggi.civil;

              return (
                <button
                  key={d}
                  onClick={() => setSel(d)}
                  className={`cal-day ${isToday ? 'cal-day--today' : ''} ${mine ? 'cal-day--mine' : ''}`}
                  aria-label={`${mese.name} ${d}, ${gregorianoBreve(civil)}`}
                >
                  <span className="cal-day__n">{d}</span>
                  <span className="cal-day__g">{gregorianoBreve(civil)}</span>
                  <span className="cal-day__dots">
                    {sacred && <i className="dot dot--olive" />}
                    {fest && <i className="dot dot--gold" />}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="cal-legend">
            <span><i className="dot dot--olive" /> rito o dedica</span>
            <span><i className="dot dot--gold" /> festa</span>
            <span><i className="ring" /> un tuo dio</span>
          </div>
        </Card>

        <p className="t-second" style={{ textAlign: 'center', color: 'var(--dim)' }}>
          Il mese inizia con la Noumenía (luna nuova) e finisce col Deîpnon (luna scura);
          date calcolate sul fuso attuale.
        </p>
      </div>

      <BottomSheet
        open={sel != null}
        onClose={() => setSel(null)}
        title={sel != null ? `${mese.name} ${sel}` : undefined}
      >
        {sel != null && (
          <div className="stack">
            <p className="t-second" style={{ marginTop: -8 }}>
              {gregorianoEsteso(mese.start + sel - 1)}
            </p>

            {sel === 1 && <p className="t-body"><strong>Noumenía</strong> — la luna nuova apre il mese.</p>}
            {sel === mese.length && <p className="t-body"><strong>Deîpnon</strong> — luna scura, l’ultimo giorno del mese.</p>}

            {selSacred && <p className="t-body">{selSacred.note}</p>}

            {selFestival && (
              <div>
                <Label>Festa</Label>
                <h3 className="t-section" style={{ marginTop: 4 }}>{selFestival.n}</h3>
                <p className="t-prose" style={{ marginTop: 'var(--s2)' }}>{selFestival.cos}</p>
                <div style={{ height: 'var(--s3)' }} />
                <TextBlock title="Nell'antichità" text={selFestival.allora} />
                <div style={{ height: 'var(--s3)' }} />
                <TextBlock title="Oggi puoi" text={selFestival.adesso} />
              </div>
            )}

            {selGods.length > 0 && (
              <div>
                <Label>Dèi del giorno</Label>
                <div className="wrap" style={{ marginTop: 'var(--s3)' }}>
                  {selGods.map((id) => (
                    <OrbItem key={id} name={nameOf(id)} onClick={() => nav(`/grimorio?dio=${id}`)} />
                  ))}
                </div>
              </div>
            )}

            {!selSacred && !selFestival && (
              <p className="empty">Giorno ordinario del mese.</p>
            )}
          </div>
        )}
      </BottomSheet>
    </main>
  );
}
