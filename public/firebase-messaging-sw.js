// [Google Firebase Cloud Messaging Service Worker for Wooriapt Car QR CD Platform]
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

self.addEventListener("install", function(event) {
  self.skipWaiting();
});

self.addEventListener("activate", function(event) {
  event.waitUntil(self.clients.claim());
});

firebase.initializeApp({
  apiKey: "AIzaSyB3nZdmUrj2wsKPQpOV8dlso7iI7fZo0Hc",
  authDomain: "wooriapt-carqr.firebaseapp.com",
  projectId: "wooriapt-carqr",
  storageBucket: "wooriapt-carqr.firebasestorage.app",
  messagingSenderId: "101299637796",
  appId: "1:101299637796:web:cb69372592026b7aa192b1"
});

const messaging = firebase.messaging();

function getNotificationDetails(payload) {
  let title = (payload && payload.notification && payload.notification.title) ||
              (payload && payload.data && payload.data.title) ||
              "🚗 [우리아파트CD 안심주차] 차량이동 요청";

  let body = (payload && payload.notification && payload.notification.body) ||
             (payload && payload.data && payload.data.body) ||
             "주차된 차량의 이동 요청이 접수되었습니다. 지금 확인해 주세요.";

  let targetUrl = (payload && payload.data && payload.data.url) || "/c.html?view=owner";

  const options = {
    body: body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [500, 250, 500, 250, 500],
    requireInteraction: true,
    renotify: true,
    tag: "wooriaptcd-" + Date.now(),
    data: {
      url: targetUrl
    }
  };

  return { title: title, options: options };
}

messaging.onBackgroundMessage(function(payload) {
  const details = getNotificationDetails(payload);
  return self.registration.showNotification(details.title, details.options);
});

self.addEventListener("notificationclick", function(event) {
  event.notification.close();
  const urlToOpen = (event.notification.data && event.notification.data.url) ? event.notification.data.url : "/c.html?view=owner";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function(windowClients) {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(urlToOpen) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
