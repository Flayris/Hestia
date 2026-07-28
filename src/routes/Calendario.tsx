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
import { useSettings } from '../settings';
import { useT } from '../i18n';

export function Calendario() {
  const nav = useNavigate();
  const { ids: myGods } = useMyGods();
  const t = useT();
  const { settings } = useSettings();
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
        <div className="cal-header">
          <p className="t-label">{t.atticCalendar}</p>

          <div className="cal-nav">
            <button
              className="cal-nav__btn"
              onClick={() => setMese(shiftMonth(mese, -1))}
              aria-label={t.prevMonth}
            >‹</button>

            <div className="cal-nav__title">
              <h1 className="t-screen">{mese.name}</h1>
              <p className="t-second">{etichettaAnno(mese, settings.lang)}</p>
            </div>

            <button
              className="cal-nav__btn"
              onClick={() => setMese(shiftMonth(mese, +1))}
              aria-label={t.nextMonth}
            >›</button>
          </div>

          {!eMeseCorrente && (
            <button className="chip" onClick={() => setMese(oggi.month)}>
              {t.backToToday}
            </button>
          )}
          {mese.intercalary && (
            <p className="t-second" style={{ marginTop: 'var(--s2)', color: 'var(--terra)' }}>
              {t.intercalary}
            </p>
          )}
        </div>
      </header>

      <div className="stack">
        <Card>
          <div className="cal-head">
            {t.weekdays.map((d, i) => <span key={i}>{d}</span>)}
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
            <span><i className="dot dot--olive" /> {t.legendRite}</span>
            <span><i className="dot dot--gold" /> {t.legendFestival}</span>
            <span><i className="ring" /> {t.legendYours}</span>
          </div>
        </Card>

        <p className="t-second" style={{ textAlign: 'center', color: 'var(--dim)' }}>
          {t.calendarNote}
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
              {gregorianoEsteso(mese.start + sel - 1, settings.lang)}
            </p>

            {sel === 1 && <p className="t-body"><strong>Noumenía</strong> — {t.noumeniaDesc}</p>}
            {sel === mese.length && <p className="t-body"><strong>Deîpnon</strong> — {t.deipnonDesc}</p>}

            {selSacred && <p className="t-body">{selSacred.note}</p>}

            {selFestival && (
              <div>
                <Label>{t.festival}</Label>
                <h3 className="t-section" style={{ marginTop: 4 }}>{selFestival.n}</h3>
                <p className="t-prose" style={{ marginTop: 'var(--s2)' }}>{selFestival.cos}</p>
                <div style={{ height: 'var(--s3)' }} />
                <TextBlock title={t.backThen} text={selFestival.allora} />
                <div style={{ height: 'var(--s3)' }} />
                <TextBlock title={t.nowYouCan} text={selFestival.adesso} />
              </div>
            )}

            {selGods.length > 0 && (
              <div>
                <Label>{t.godsOfDay}</Label>
                <div className="wrap" style={{ marginTop: 'var(--s3)' }}>
                  {selGods.map((id) => (
                    <OrbItem key={id} name={nameOf(id)} onClick={() => nav(`/grimorio?dio=${id}`)} />
                  ))}
                </div>
              </div>
            )}

            {!selSacred && !selFestival && (
              <p className="empty">{t.ordinaryDay}</p>
            )}
          </div>
        )}
      </BottomSheet>
    </main>
  );
}
