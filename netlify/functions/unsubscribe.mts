import { getStore } from '@netlify/blobs';

/** Cancella l'iscrizione di un dispositivo. Spegnere le notifiche deve
    cancellare davvero il dato, non solo smettere di usarlo. */

const CORS = {
  'Access-Control-Allow-Origin': 'https://flayris.github.io',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function chiave(endpoint: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(endpoint));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

export default async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return new Response('metodo non ammesso', { status: 405, headers: CORS });

  let endpoint: string | undefined;
  try { ({ endpoint } = await req.json()); } catch { /* corpo assente */ }
  if (!endpoint) {
    return new Response(JSON.stringify({ errore: 'endpoint mancante' }), {
      status: 400, headers: { 'Content-Type': 'application/json', ...CORS },
    });
  }

  await getStore('iscrizioni').delete(await chiave(endpoint));

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
};
