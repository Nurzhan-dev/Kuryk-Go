self.addEventListener('push', function(event) {
  // Проверяем, есть ли данные в пуше
  if (!event.data) {
    console.log('Пуш-уведомление без данных');
    return;
  }

  const data = event.data.json();
  
  // Обязательно оборачиваем в event.waitUntil
  event.waitUntil(
    self.registration.showNotification(data.title || 'Заказ принят, водитель в пути', {
      icon: '/logo.jpg',
      badge: '/logo.jpg',
      vibrate: [200, 100, 200],
      tag: 'order-update', // Группирует уведомления, чтобы не спамить
      renotify: true,      // Заставляет телефон вибрировать при новом пуше с тем же тегом
      data: { 
        url: data.url || '/' 
      },
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Если вкладка уже открыта — просто переключаемся на неё
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Если вкладок нет — открываем новую
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
