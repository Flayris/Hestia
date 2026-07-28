import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Label, OrbItem, Button } from '../components/ui';
import { MoonWidget, phaseIndex } from '../components/MoonWidget';
import { SettingsSheet, SettingsButton } from '../components/SettingsSheet';
import { dataEllenica, moonPhase, gregorianoEsteso, etichettaAnno } from '../lib/calendar';
import { upcoming } from '../lib/notifications';
import { useContent } from '../data/content';
import { useMyGods, useDismissed } from '../store';
import { useSettings } from '../settings';
import { useT } from '../i18n';

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function Oggi() {
  const now = useNow();
  const nav = useNavigate();
  const t = useT();
  const { settings } = useSettings();
  const { ids: myGods } = useMyGods();
  const { ids: dismissed, dismiss } = useDismissed();
  const { sacredDay, festivalOn, nameOf } = useContent();
  const [impostazioni, setImpostazioni] = useState(false);

  const today = dataEllenica(now);
  const phase = moonPhase(now);
  const faseNome = t.phases[phaseIndex(phase)];
  const sacred = sacredDay(today.day, today.month.length);
  const festival = festivalOn(today.month.name, today.day);
  const notifications = upcoming(myGods, now, settings.lang).filter((n) => !dismissed.includes(n.id));

  const clock = now.toLocaleTimeString(settings.lang === 'it' ? 'it-IT' : 'en-GB',
    { hour: '2-digit', minute: '2-digit' });

  const dedicati = sacred?.gods ?? festival?.gods ?? [];

  return (
    <main className="screen">
      <header className="appbar app-chrome">
        <div className="homebar">
          <div>
            <p className="t-greeting" lang="grc">Χαῖρε</p>
            {settings.name && <h1 className="t-screen">{settings.name}</h1>}
          </div>
          <p className="t-clock">{clock}</p>
          <div className="homebar__end">
            <SettingsButton onClick={() => setImpostazioni(true)} />
          </div>
        </div>
      </header>

      <div className="stack">
        {/* --- data ellenica --- */}
        <Card style={{ textAlign: 'center' }}>
          <p className="t-date">{today.month.name} {today.day}</p>
          <p className="t-second" style={{ marginTop: 2 }}>{gregorianoEsteso(today.civil, settings.lang)}</p>
          <p className="t-second" style={{ color: 'var(--dim)' }}>{etichettaAnno(today.month, settings.lang)}</p>
        </Card>

        {/* --- fase lunare --- */}
        <Card>
          <div className="row" style={{ gap: 'var(--s5)' }}>
            <MoonWidget phase={phase} size={92} label={faseNome} />
            <div>
              <Label>{t.moonPhase}</Label>
              <p className="t-card" style={{ marginTop: 2 }}>{faseNome}</p>
              <p className="t-second">{t.dayOfMonth(today.day, today.month.length)}</p>
            </div>
          </div>
        </Card>

        {/* --- dedica di oggi: solo nei giorni che hanno davvero una dedica --- */}
        {dedicati.length > 0 && (
          <section>
            <Label>{t.todayDedication}</Label>
            <div style={{ height: 'var(--s2)' }} />
            <Card>
              <div className="wrap" style={{ justifyContent: 'center', gap: 'var(--s4)' }}>
                {dedicati.map((id) => (
                  <OrbItem key={id} name={nameOf(id)} onClick={() => nav(`/grimorio?dio=${id}`)} />
                ))}
              </div>
              {sacred && <p className="t-second" style={{ marginTop: 'var(--s4)' }}>{sacred.note}</p>}
            </Card>
          </section>
        )}

        {/* --- festa di oggi --- */}
        {festival && (
          <Card>
            <Label>{t.todayFestival}</Label>
            <h2 className="t-section" style={{ marginTop: 4 }}>{festival.n}</h2>
            <p className="t-body" style={{ marginTop: 'var(--s2)' }}>{festival.adesso}</p>
          </Card>
        )}

        {/* --- centro notifiche: solo i prossimi 7 giorni, e solo se c'è qualcosa --- */}
        {notifications.length > 0 && (
          <section>
            <Label>{t.thisWeek}</Label>
            <div style={{ height: 'var(--s2)' }} />
            <div className="stack-s">
              {notifications.map((n) => (
                <Card key={n.id}>
                  <div className="row--between">
                    <div style={{ minWidth: 0 }}>
                      <p className="t-card">{n.title}</p>
                      <p className="t-second">{n.subtitle}</p>
                    </div>
                    <button
                      onClick={() => dismiss(n.id)}
                      aria-label={`${t.hide} ${n.title}`}
                      style={{ color: 'var(--dim)', fontSize: 20, lineHeight: 1, padding: '8px 4px' }}
                    >
                      ×
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* --- scorciatoie --- */}
        <div className="wrap" style={{ justifyContent: 'center', marginTop: 'var(--s2)' }}>
          <Button variant="ghost" onClick={() => nav('/musica')}>{t.music}</Button>
          <Button variant="ghost" onClick={() => nav('/diario')}>{t.todayDiary}</Button>
          <Button variant="ghost" onClick={() => nav('/tuoi-dei')}>{t.yourGods}</Button>
        </div>
      </div>

      <SettingsSheet open={impostazioni} onClose={() => setImpostazioni(false)} />
    </main>
  );
}
