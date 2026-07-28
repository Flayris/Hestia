import { getStore } from '@netlify/blobs';

/**
 * Registra (o aggiorna) l'iscrizione di un dispositivo alle notifiche.
 *
 * L'unico dato di Hestía che esce dal telefono: l'indirizzo a cui recapitare
 * le notifiche, il fuso orario, la lingua e il nome scelto. Il diario, i tuoi
 * dèi e le impostazioni restano sul dispositivo.
 */

const CORS = {
  'Access-Control-Allow-Origin': 'https://flayris.github.io',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });

/** Chiave stabile e non reversibile a partire dall'endpoint. */
async function chiave(endpoint: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(endpoint));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

export interface Iscrizione {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  tz: string;
  lang: 'it' | 'en';
  nome: string;
  mattino: boolean;
  sera: boolean;
  eventi: boolean;
  creata: string;
}

export default async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return json({ errore: 'metodo non ammesso' }, 405);

  let corpo: Partial<Iscrizione> & { subscription?: { endpoint: string; keys: Iscrizione['keys'] } };
  try {
    corpo = await req.json();
  } catch {
    return json({ errore: 'JSON non valido' }, 400);
  }

  const sub = corpo.subscription;
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    return json({ errore: 'iscrizione incompleta' }, 400);
  }

  // Il fuso deve essere un identificatore IANA valido: serve a calcolare
  // quando da te sono le 9 e le 22.
  const tz = corpo.tz ?? 'UTC';
  try {
    new Intl.DateTimeFormat('en', { timeZone: tz });
  } catch {
    return json({ errore: `fuso orario non valido: ${tz}` }, 400);
  }

  const iscrizione: Iscrizione = {
    endpoint: sub.endpoint,
    keys: sub.keys,
    tz,
    lang: corpo.lang === 'en' ? 'en' : 'it',
    nome: (corpo.nome ?? '').slice(0, 24),
    mattino: corpo.mattino !== false,
    sera: corpo.sera !== false,
    eventi: corpo.eventi !== false,
    creata: new Date().toISOString(),
  };

  const store = getStore('iscrizioni');
  await store.setJSON(await chiave(sub.endpoint), iscrizione);

  return json({ ok: true });
};
