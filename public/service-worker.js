// Minimal service worker: only handles Web Push display + notification clicks.
self.addEventListener('push', (event) => {
  let data = { title: 'MarketPlace', body: 'You have a new notification.' };
  try {
    if (event.data) data = event.data.json();
  } catch (err) {
    data.body = event.data ? event.data.text() : data.body;
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/images/virutcham-logo.jpg',
      data: { url: data.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(clients.openWindow(url));
});
