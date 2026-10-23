/* global firebase */
importScripts("https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js");

const config = Object.fromEntries(new URL(self.location.href).searchParams.entries());
firebase.initializeApp(config);
firebase.messaging();

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const route = event.notification?.data?.FCM_MSG?.data?.route || "/bookings";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const existing = windows.find((client) => "focus" in client);
      if (existing) {
        existing.navigate(route);
        return existing.focus();
      }
      return clients.openWindow(route);
    }),
  );
});
