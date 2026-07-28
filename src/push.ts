import type { Lang } from './lang';

/**
 * Iscrizione alle notifiche.
 *
 * Su iPhone funziona solo se l'app è stata aggiunta alla schermata Home:
 * Safari non concede le notifiche a una pagina aperta nel browser.
 */

const SERVIZIO = 'https://hestia-push.netlify.app/.netlify/functions';
const CHIAVE_PUBBLICA = 'BDseUECD6NSlc9ycT_bCEJAPc1zQLh6REIX3l3xZ35_e0nGuYn7TmoEE7yRQbdgrRfbxj45v-rbuXxtToEAfBMA';

export type StatoPush =
  | 'nonSupportato'      // il browser non ha le notifiche push
  | 'daInstallare'       // iOS: serve "Aggiungi a Home"
  | 'negato'             // permesso rifiutato
  | 'spente'
  | 'accese';

const base64UrlToUint8 = (s: string) => {
  const b64 = (s + '='.repeat((4 - (s.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
};

const supportato = () =>
  'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

/** Su iOS le notifiche esistono solo per una PWA installata. */
const iosNonInstallata = () => {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const standalone = window.matchMedia('(display-mode: standalone)').matches
    || (navigator as unknown as { standalone?: boolean }).standalone === true;
  return ios && !standalone;
};

export async function stato(): Promise<StatoPush> {
  if (!supportato()) return iosNonInstallata() ? 'daInstallare' : 'nonSupportato';
  if (iosNonInstallata()) return 'daInstallare';
  if (Notification.permission === 'denied') return 'negato';

  const reg = await navigator.serviceWorker.ready;
  return (await reg.pushManager.getSubscription()) ? 'accese' : 'spente';
}

export interface Preferenze {
  lang: Lang;
  nome: string;
  mattino: boolean;
  sera: boolean;
  eventi: boolean;
}

/** Chiede il permesso, si iscrive e comunica le preferenze al servizio. */
export async function accendi(pref: Preferenze): Promise<StatoPush> {
  if (!supportato()) return iosNonInstallata() ? 'daInstallare' : 'nonSupportato';
  if (iosNonInstallata()) return 'daInstallare';

  const permesso = await Notification.requestPermission();
  if (permesso !== 'granted') return permesso === 'denied' ? 'negato' : 'spente';

  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription()
    ?? await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToUint8(CHIAVE_PUBBLICA),
    });

  await invia(sub, pref);
  return 'accese';
}

/** Aggiorna le preferenze se l'iscrizione esiste già (lingua, nome, orari). */
export async function aggiorna(pref: Preferenze) {
  if (!supportato()) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) await invia(sub, pref);
}

export async function spegni() {
  if (!supportato()) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;

  // Prima si cancella dal servizio, poi dal dispositivo: se il primo passo
  // fallisce, l'iscrizione resta valida e si può riprovare.
  await fetch(`${SERVIZIO}/unsubscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: sub.endpoint }),
  }).catch(() => { /* riproverà alla prossima volta */ });

  await sub.unsubscribe();
}

async function invia(sub: PushSubscription, pref: Preferenze) {
  const j = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
  const r = await fetch(`${SERVIZIO}/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscription: { endpoint: j.endpoint, keys: j.keys },
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ...pref,
    }),
  });
  if (!r.ok) throw new Error(`il servizio ha risposto ${r.status}`);
}
