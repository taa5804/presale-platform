const CACHE_NAME = 'wooriaptcd-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

// [1] Web Push Notification Listener
self.addEventListener('push', (event) => {
  let title = '🚗 [우리아파트CD 안심주차] 차량이동 요청';
  let body = '주차된 차량의 이동 요청이 접수되었습니다. 지금 확인해 주세요.';
  let targetUrl = '/c.html?view=owner';

  if (event.data) {
    try {
      const json = event.data.json();
      if (json.notification) {
        title = json.notification.title || title;
        body = json.notification.body || body;
      }
      if (json.data) {
        title = json.data.title || title;
        body = json.data.body || body;
        if (json.data.url) targetUrl = json.data.url;
      }
      if (json.title) title = json.title;
      if (json.body) body = json.body;
      if (json.url) targetUrl = json.url;
    } catch (e) {
      body = event.data.text() || body;
    }
  }

  const options = {
    body: body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [500, 250, 500, 250, 500],
    requireInteraction: true,
    renotify: true,
    tag: 'wooriaptcd-push-' + Date.now(),
    data: {
      url: targetUrl
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// [2] Push Notification Click Listener
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/c.html?view=owner';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
