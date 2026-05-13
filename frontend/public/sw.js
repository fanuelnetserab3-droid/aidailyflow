self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// Lyssna på push-meddelanden från backend
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'AiDailyFlow', body: 'Dags att kolla ditt schema!' };
  e.waitUntil(
    self.registration.showNotification(data.title || 'AiDailyFlow', {
      body: data.body || 'Dags att kolla ditt schema!',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/idag' },
      actions: [
        { action: 'open', title: 'Öppna schema' },
        { action: 'close', title: 'Stäng' }
      ]
    })
  );
});

// Klick på notis öppnar appen
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url || '/idag';
  if (e.action === 'close') return;
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

// Schemalägg lokala notiser (körs när SW startar)
self.addEventListener('message', e => {
  if (e.data?.type === 'SCHEDULE_NOTIFICATIONS') {
    const { wakeTime } = e.data;
    scheduleDaily(wakeTime);
  }
});

function scheduleDaily(wakeTime) {
  // Lokala notiser via setTimeout — fungerar när appen är öppen
  const now = new Date();
  const [wh, wm] = (wakeTime || '08:00').split(':').map(Number);

  // Morgonnotis vid uppvakningsdags
  const morning = new Date(now);
  morning.setHours(wh, wm, 0, 0);
  if (morning <= now) morning.setDate(morning.getDate() + 1);
  const msToMorning = morning - now;

  setTimeout(() => {
    self.registration.showNotification('🌅 God morgon!', {
      body: 'Ditt schema för idag är klart. Dags att köra!',
      icon: '/icons/icon-192.png',
      data: { url: '/idag' }
    });
  }, msToMorning);

  // Kvällsnotis kl 20:30
  const evening = new Date(now);
  evening.setHours(20, 30, 0, 0);
  if (evening <= now) evening.setDate(evening.getDate() + 1);
  const msToEvening = evening - now;

  setTimeout(() => {
    self.registration.showNotification('🌙 Kvällsreflektion', {
      body: 'Hur gick dagen? Checka av dina uppgifter!',
      icon: '/icons/icon-192.png',
      data: { url: '/idag' }
    });
  }, msToEvening);
}
