self.addEventListener('push', function(event) {
  const data = event.data.json();
  
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/logo.jpg',
    badge: '/logo.jpg',
    vibrate: [200, 100, 200],
    data: { 
      url: data.url || '/' // Сохраняем URL из пришедших данных
    },
  });
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  // Берем URL из данных уведомления или открываем главную
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.openWindow(urlToOpen)
  );
});
