import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Label, OrbItem, Button } from '../components/ui';
import { MoonWidget, phaseName } from '../components/MoonWidget';
import { hellenicDate, moonPhase } from '../lib/calendar/stub';
import { upcoming } from '../lib/notifications';
import { sacredDay, festivalOn, nameOf } from '../data/content';
import { useMyGods, useDismissed } from '../store';

const GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
  'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

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
  const { ids: myGods } = useMyGods();
  const { ids: dismissed, dismiss } = useDismissed();

  const today = hellenicDate(now);
  const phase = moonPhase(now);
  const sacred = sacredDay(today.day, today.monthLength);
  const festival = festivalOn(today.monthName, today.day);
  const notifications = upcoming(myGods, now).filter((n) => !dismissed.includes(n.id));

  const clock = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  const gregorian = `${GIORNI[now.getDay()]} ${now.getDate()} ${MESI[now.getMonth()]} ${now.getFullYear()}`;

  const dedicati = sacred?.gods ?? festival?.gods ?? [];

  return (
    <main className="screen">
      <header className="appbar app-chrome">
        <div>
          <p className="t-greeting" lang="grc">Χαῖρε</p>
          <h1 className="t-screen">Gaia</h1>
        </div>
        <p className="t-clock">{clock}</p>
      </header>

      <div className="stack">
        {/* --- data ellenica --- */}
        <Card>
          <p className="t-date">{today.monthName} {today.day}</p>
          <p className="t-second" style={{ marginTop: 2 }}>{gregorian}</p>
          <p className="t-second" style={{ color: 'var(--dim)' }}>{today.yearLabel}</p>
        </Card>

        {/* --- fase lunare --- */}
        <Card>
          <div className="row" style={{ gap: 'var(--s5)' }}>
            <MoonWidget phase={phase} size={92} />
            <div>
              <Label>Fase lunare</Label>
              <p className="t-card" style={{ marginTop: 2 }}>{phaseName(phase)}</p>
              <p className="t-second">
                giorno {today.day} di {today.monthLength} del mese lunare
              </p>
            </div>
          </div>
        </Card>

        {/* --- dedica di oggi --- */}
        <section>
          <Label>Dedica di oggi</Label>
          <div style={{ height: 'var(--s2)' }} />
          {dedicati.length > 0 ? (
            <Card>
              <div className="wrap" style={{ justifyContent: 'center', gap: 'var(--s4)' }}>
                {dedicati.map((id) => (
                  <OrbItem
                    key={id}
                    name={nameOf(id)}
                    onClick={() => nav(`/grimorio?dio=${id}`)}
                  />
                ))}
              </div>
              {sacred && <p className="t-second" style={{ marginTop: 'var(--s4)' }}>{sacred.note}</p>}
            </Card>
          ) : (
            <Card>
              <p className="empty" style={{ padding: 0 }}>
                Nessun giorno sacro oggi: è un giorno ordinario del mese.
                <br />La pratica quotidiana resta — Estia prima e ultima.
              </p>
            </Card>
          )}
        </section>

        {/* --- festa di oggi --- */}
        {festival && (
          <Card>
            <Label>Festa di oggi</Label>
            <h2 className="t-section" style={{ marginTop: 4 }}>{festival.n}</h2>
            <p className="t-body" style={{ marginTop: 'var(--s2)' }}>{festival.adesso}</p>
          </Card>
        )}

        {/* --- centro notifiche --- */}
        <section>
          <Label>Prossimamente</Label>
          <div style={{ height: 'var(--s2)' }} />
          <div className="stack-s">
            {notifications.length === 0 && (
              <Card><p className="empty" style={{ padding: 0 }}>Nulla in arrivo nei prossimi giorni.</p></Card>
            )}
            {notifications.map((n) => (
              <Card key={n.id}>
                <div className="row--between">
                  <div style={{ minWidth: 0 }}>
                    <p className="t-card">{n.title}</p>
                    <p className="t-second">{n.subtitle}</p>
                  </div>
                  <button
                    onClick={() => dismiss(n.id)}
                    aria-label={`Nascondi ${n.title}`}
                    style={{ color: 'var(--dim)', fontSize: 20, lineHeight: 1, padding: '8px 4px' }}
                  >
                    ×
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* --- scorciatoie --- */}
        <div className="wrap" style={{ justifyContent: 'center', marginTop: 'var(--s2)' }}>
          <Button variant="ghost" onClick={() => nav('/musica')}>Musica</Button>
          <Button variant="ghost" onClick={() => nav('/diario')}>Diario di oggi</Button>
          <Button variant="ghost" onClick={() => nav('/tuoi-dei')}>I tuoi dèi</Button>
        </div>
      </div>
    </main>
  );
}
