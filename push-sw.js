/* Web Push for Arevim, imported into the generated service worker (vite.config.ts). */
// App paths ('/c/…') resolve under the service worker's scope, so this works at the site root
// and under a sub-path such as /arevim-site/.
const inApp = (path) =>
  new URL(String(path || '').replace(/^\/+/, ''), self.registration.scope).href;

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : '' };
  }
  const he = data.lang !== 'en';
  event.waitUntil(
    self.registration.showNotification(data.title || (he ? 'ערבים' : 'Arevim'), {
      body: data.body || '',
      tag: data.tag,
      lang: he ? 'he' : 'en',
      dir: he ? 'rtl' : 'ltr',
      icon: inApp('pwa-192x192.png'),
      badge: inApp('pwa-64x64.png'),
      data: { url: data.url || '/' },
      // One-tap answers for "are you coming?" (T33).
      actions: Array.isArray(data.actions) ? data.actions.slice(0, 3) : [],
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  let url = inApp((event.notification.data && event.notification.data.url) || '/');
  // A tapped answer opens the app, which records it (the service worker has no sign-in).
  if (event.action)
    url += (url.includes('?') ? '&' : '?') + 'answer=' + encodeURIComponent(event.action);
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url.startsWith(self.registration.scope) && 'focus' in c) {
          c.navigate(url);
          return c.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
