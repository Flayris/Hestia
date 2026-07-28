import { useEffect, useState } from 'react';
import { Toggle, Label } from './ui';
import { stato, accendi, spegni, aggiorna, type StatoPush } from '../push';
import { useSettings } from '../settings';
import { useT } from '../useT';

/**
 * Accensione delle notifiche quotidiane.
 * Il permesso si chiede da qui, non all'avvio: chiedere le notifiche appena
 * si apre un'app è il modo migliore per farsele negare per sempre.
 */
export function Notifiche() {
  const t = useT();
  const { settings } = useSettings();
  const [s, setS] = useState<StatoPush | null>(null);
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);

  useEffect(() => { void stato().then(setS); }, []);

  const pref = {
    lang: settings.lang,
    nome: settings.name,
    mattino: true,
    sera: true,
    eventi: true,
  };

  // Se cambi nome o lingua mentre le notifiche sono accese, il servizio
  // dev'esserne informato: altrimenti continuerebbe a salutarti come prima.
  useEffect(() => {
    if (s === 'accese') void aggiorna(pref).catch(() => { /* riproverà */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.lang, settings.name, s]);

  const cambia = async (acceso: boolean) => {
    setInCorso(true);
    setErrore(null);
    try {
      if (acceso) setS(await accendi(pref));
      else { await spegni(); setS('spente'); }
    } catch (e) {
      setErrore(e instanceof Error ? e.message : String(e));
    } finally {
      setInCorso(false);
    }
  };

  if (s === null) return null;

  const messaggio =
    s === 'daInstallare' ? t.pushInstall
    : s === 'negato' ? t.pushDenied
    : s === 'nonSupportato' ? t.pushUnsupported
    : t.pushNote;

  const attivabile = s === 'spente' || s === 'accese';

  return (
    <div>
      <Label>{t.notifications}</Label>

      <div className="row--between" style={{ marginTop: 'var(--s3)' }}>
        <span className="t-body">{t.pushDaily}</span>
        <Toggle
          checked={s === 'accese'}
          onChange={cambia}
          label={t.notifications}
          disabled={!attivabile || inCorso}
        />
      </div>

      <p className="t-second" style={{ marginTop: 'var(--s2)', color: 'var(--dim)' }}>
        {messaggio}
      </p>

      {errore && (
        <p className="t-second" style={{ marginTop: 'var(--s2)', color: 'var(--terra)' }}>
          {errore}
        </p>
      )}
    </div>
  );
}
