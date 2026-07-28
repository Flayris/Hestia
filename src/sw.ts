/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope;

/**
 * Service worker di Hestía.
 * Fa due cose: tiene l'app disponibile offline, e riceve le notifiche.
 */

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });

interface Messaggio {
  title: string;
  body: string;
  sub?: string | null;
  url?: string;
  tag?: string;
}

self.addEventListener('push', (event) => {
  let m: Messaggio = { title: 'Hestía', body: '' };
  try {
    if (event.data) m = { ...m, ...(event.data.json() as Messaggio) };
  } catch {
    if (event.data) m.body = event.data.text();
  }

  // Gli eventi del giorno, se ci sono, vanno in coda alla frase.
  const corpo = m.sub ? `${m.body}\n${m.sub}` : m.body;

  event.waitUntil(
    self.registration.showNotification(m.title, {
      body: corpo,
      icon: 'icons/icon-192.png',
      badge: 'icons/icon-192.png',
      tag: m.tag,
      data: { url: m.url ?? '#/' },
    }),
  );
});

/** Un tocco riporta all'app: se è già aperta la si riusa, non se ne apre un'altra. */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data?.url as string) ?? '#/';

  event.waitUntil((async () => {
    const finestre = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of finestre) {
      if (c.url.includes('/Hestia/')) {
        await c.focus();
        if ('navigate' in c) await (c as WindowClient).navigate(`/Hestia/${url}`);
        return;
      }
    }
    await self.clients.openWindow(`/Hestia/${url}`);
  })());
});
