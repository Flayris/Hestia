import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Label, OrbItem, Greca } from '../components/ui';
import { BottomSheet } from '../components/BottomSheet';
import { hellenicDate, gregorianOfDay, MONTH_NAME, YEAR_LABEL } from '../lib/calendar/stub';
import { sacredDay, festivalOn, nameOf } from '../data/content';
import { useMyGods } from '../store';

const WEEKDAYS = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];

export function Calendario() {
  const nav = useNavigate();
  const today = hellenicDate();
  const { ids: myGods } = useMyGods();
  const [selected, setSelected] = useState<number | null>(null);

  const length = today.monthLength;
  const days = Array.from({ length }, (_, i) => i + 1);

  // Allineamento ai giorni della settimana, con la settimana che parte da lunedì.
  const firstWeekday = (gregorianOfDay(1).getDay() + 6) % 7;

  const sel = selected != null ? selected : null;
  const selSacred = sel != null ? sacredDay(sel, length) : undefined;
  const selFestival = sel != null ? festivalOn(MONTH_NAME, sel) : undefined;
  const selGods = selSacred?.gods ?? selFestival?.gods ?? [];

  return (
    <main className="screen">
      <header className="appbar app-chrome">
        <div>
          <p className="t-label">Calendario ateniese</p>
          <h1 className="t-screen">{MONTH_NAME}</h1>
          <p className="t-second">{YEAR_LABEL}</p>
        </div>
      </header>

      <div className="stack">
        <Card>
          <div className="cal-head">
            {WEEKDAYS.map((d, i) => <span key={i}>{d}</span>)}
          </div>

          <div className="cal-grid">
            {Array.from({ length: firstWeekday }, (_, i) => <span key={`pad-${i}`} />)}

            {days.map((d) => {
              const g = gregorianOfDay(d);
              const sacred = sacredDay(d, length);
              const fest = festivalOn(MONTH_NAME, d);
              const mine = (sacred?.gods ?? fest?.gods ?? []).some((id) => myGods.includes(id));
              const isToday = d === today.day;

              return (
                <button
                  key={d}
                  onClick={() => setSelected(d)}
                  className={`cal-day ${isToday ? 'cal-day--today' : ''} ${mine ? 'cal-day--mine' : ''}`}
                  aria-label={`Giorno ${d}, ${g.getDate()}/${g.getMonth() + 1}`}
                >
                  <span className="cal-day__n">{d}</span>
                  <span className="cal-day__g">{g.getDate()}/{g.getMonth() + 1}</span>
                  <span className="cal-day__dots">
                    {sacred && <i className="dot dot--olive" />}
                    {fest && <i className="dot dot--gold" />}
                  </span>
                </button>
              );
            })}
          </div>

          <Greca />

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
        onClose={() => setSelected(null)}
        title={sel != null ? `${MONTH_NAME} ${sel}` : undefined}
      >
        {sel != null && (
          <div className="stack">
            <p className="t-second">
              {gregorianOfDay(sel).toLocaleDateString('it-IT', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>

            {sel === 1 && <p className="t-body"><strong>Noumenía</strong> — la luna nuova apre il mese.</p>}
            {sel === length && <p className="t-body"><strong>Deîpnon</strong> — luna scura, l’ultimo giorno del mese.</p>}

            {selSacred && <p className="t-body">{selSacred.note}</p>}

            {selFestival && (
              <div>
                <Label>Festa</Label>
                <h3 className="t-section" style={{ marginTop: 4 }}>{selFestival.n}</h3>
                <p className="t-prose" style={{ marginTop: 'var(--s2)' }}>{selFestival.cos}</p>
                <p className="t-label" style={{ marginTop: 'var(--s3)' }}>Allora</p>
                <p className="t-body">{selFestival.allora}</p>
                <p className="t-label" style={{ marginTop: 'var(--s3)' }}>Oggi puoi</p>
                <p className="t-body">{selFestival.adesso}</p>
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
