import type { Config } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import webpush from 'web-push';

import { benedizione, eventiDelGiorno } from '../../src/lib/blessings';
import { today } from '../../src/lib/calendar/athenian';
import type { Iscrizione } from './subscribe.mts';

/**
 * Gira ogni ora e decide chi ha diritto a una notifica in questo momento.
 *
 * Non "manda alle 9": manda a chi, nel PROPRIO fuso, sono le 9. È l'unico modo
 * perché il buongiorno arrivi al mattino anche cambiando continente — lo stesso
 * principio su cui è costruito il calendario ateniese dell'app.
 */

const ORA_MATTINO = 9;
const ORA_SERA = 22;

/** Ora locale (0–23) in un fuso IANA. */
function oraLocale(adesso: Date, tz: string): number {
  const f = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', hour12: false });
  return Number(f.format(adesso));
}

export default async (req?: Request) => {
  /**
   * Prova manuale: `?prova=mattino&token=…` invia subito, ignorando l'ora.
   * Protetta da un token, altrimenti chiunque potrebbe farti squillare il
   * telefono a piacere.
   */
  let forzato: 'mattino' | 'sera' | null = null;
  if (req) {
    const u = new URL(req.url);
    const p = u.searchParams.get('prova');
    if (p === 'mattino' || p === 'sera') {
      if (u.searchParams.get('token') !== process.env.PROVA_TOKEN) {
        return new Response('token non valido', { status: 403 });
      }
      forzato = p;
    }
  }

  const publicKey = process.env.VAPID_PUBLIC;
  const privateKey = process.env.VAPID_PRIVATE;
  if (!publicKey || !privateKey) {
    console.error('chiavi VAPID assenti: nessun invio');
    return new Response('chiavi assenti', { status: 500 });
  }
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? 'mailto:noreply@hestia.app',
    publicKey,
    privateKey,
  );

  const store = getStore('iscrizioni');
  const { blobs } = await store.list();
  const adesso = new Date();

  let inviate = 0, saltate = 0, rimosse = 0, errori = 0;

  for (const { key } of blobs) {
    const s = await store.get(key, { type: 'json' }) as Iscrizione | null;
    if (!s) continue;

    let ora: number;
    try {
      ora = oraLocale(adesso, s.tz);
    } catch {
      console.error(`fuso non valido su ${key}: ${s.tz}`);
      errori++;
      continue;
    }

    const momento = forzato
      ?? (ora === ORA_MATTINO ? 'mattino' : ora === ORA_SERA ? 'sera' : null);
    if (!momento) { saltate++; continue; }
    if (momento === 'mattino' && !s.mattino) { saltate++; continue; }
    if (momento === 'sera' && !s.sera) { saltate++; continue; }

    // Il giorno civile va calcolato NEL FUSO dell'utente, non in quello del server.
    const giorno = today(adesso, s.tz);
    const b = benedizione(momento, giorno, s.lang, s.nome);
    const eventi = s.eventi ? eventiDelGiorno(giorno, s.lang) : null;

    const payload = JSON.stringify({
      title: b.titolo,
      body: b.testo,
      // Gli eventi del giorno compaiono solo al mattino: la sera è per chiudere.
      sub: momento === 'mattino' ? eventi : null,
      url: momento === 'mattino' ? '#/' : '#/diario',
      tag: `hestia-${momento}-${giorno}`,
    });

    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: s.keys },
        payload,
        { TTL: 3 * 3600 },
      );
      inviate++;
    } catch (e) {
      const stato = (e as { statusCode?: number }).statusCode;
      // 404/410: l'iscrizione non esiste più (app disinstallata, permesso
      // revocato). Va cancellata, altrimenti resta a sporcare per sempre.
      if (stato === 404 || stato === 410) {
        await store.delete(key);
        rimosse++;
      } else {
        console.error(`invio fallito (${stato ?? 'ignoto'}) su ${key}`);
        errori++;
      }
    }
  }

  const esito = { inviate, saltate, rimosse, errori, iscrizioni: blobs.length };
  console.log('esito invio:', JSON.stringify(esito));
  return new Response(JSON.stringify(esito), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const config: Config = {
  schedule: '@hourly',
};
