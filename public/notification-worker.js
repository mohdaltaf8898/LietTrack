// Reserved for a future authenticated Web Push delivery service. This worker is
// intentionally not registered until server-side subscription and delivery exist.
self.addEventListener('push', event => {
  let payload = {};
  try { payload = event.data?.json() || {}; } catch { /* ignore malformed payload */ }
  const title = typeof payload.title === 'string' ? payload.title.slice(0, 120) : 'LIETTrack update';
  const body = typeof payload.body === 'string' ? payload.body.slice(0, 300) : 'Open LIETTrack to view your notifications.';
  event.waitUntil(self.registration.showNotification(title, {body, data:{path:'/notifications'}}));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow('/notifications'));
});
