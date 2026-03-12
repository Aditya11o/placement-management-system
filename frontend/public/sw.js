/* eslint-disable no-restricted-globals */
self.addEventListener('push', (event) => {
    let data = {};
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data = { title: 'New Notification', message: event.data.text() };
        }
    }

    const title = data.title || 'TNU PMS';
    const options = {
        body: data.message || data.body || 'You have a new update.',
        icon: data.icon || '/favicon.ico',
        badge: '/favicon.ico',
        data: {
            url: data.link || data.url || '/notifications'
        },
        actions: data.actions || [],
        tag: data.tag || 'tnu-notification',
        renotify: true
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const urlToOpen = event.notification.data.url;

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Check if there is already a window/tab open with the target URL
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, open a new window/tab
            if (self.clients.openWindow) {
                return self.clients.openWindow(urlToOpen);
            }
        })
    );
});
