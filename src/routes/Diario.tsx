import { useState } from 'react';
import { Card, Label, Button } from '../components/ui';
import { dataEllenica, dayToDate } from '../lib/calendar';
import { useDiary } from '../store';
import { useT } from '../i18n';

const MOODS = ['🙏', '🌿', '☀️', '🌙', '🔥', '💧'];

export function Diario() {
  const today = dataEllenica();
  const { entries, add, remove } = useDiary();
  const t = useT();
  const [text, setText] = useState('');
  const [mood, setMood] = useState<number | null>(null);

  const hellenicLabel = `${today.month.name} ${today.day}`;

  const save = () => {
    if (!text.trim()) return;
    add({
      hellenicDate: hellenicLabel,
      gregorian: dayToDate(today.civil).toISOString().slice(0, 10),
      text: text.trim(),
      mood,
    });
    setText('');
    setMood(null);
  };

  return (
    <main className="screen">
      <header className="appbar app-chrome">
        <h1 className="t-screen">{t.diary}</h1>
      </header>

      <div className="stack">
        <Card>
          <Label>{t.diaryToday} · {hellenicLabel}</Label>

          <div className="mood" style={{ margin: 'var(--s3) 0' }}>
            {MOODS.map((m, i) => (
              <button
                key={m}
                className="mood__btn"
                aria-pressed={mood === i}
                aria-label={t.mood(i + 1)}
                onClick={() => setMood(mood === i ? null : i)}
              >
                {m}
              </button>
            ))}
          </div>

          <textarea
            className="field"
            rows={4}
            placeholder={t.diaryPlaceholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div style={{ marginTop: 'var(--s3)', display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={save}>{t.save}</Button>
          </div>
        </Card>

        {entries.length === 0 ? (
          <Card><p className="empty" style={{ padding: 0 }}>
            {t.diaryEmpty}
          </p></Card>
        ) : (
          entries.map((e) => (
            <Card key={e.id}>
              <div className="row--between">
                <Label>{e.hellenicDate}</Label>
                <button
                  onClick={() => remove(e.id)}
                  aria-label={t.deleteEntry}
                  style={{ color: 'var(--dim)', fontSize: 18, padding: '4px 8px' }}
                >
                  ×
                </button>
              </div>
              <p className="t-prose" style={{ marginTop: 'var(--s2)' }}>
                {e.mood != null && <span style={{ marginRight: 8 }}>{MOODS[e.mood]}</span>}
                {e.text}
              </p>
              <p className="t-second" style={{ color: 'var(--dim)', marginTop: 4 }}>{e.gregorian}</p>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
