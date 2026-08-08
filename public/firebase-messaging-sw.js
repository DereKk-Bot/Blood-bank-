importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBLwtxk0A8dN-vlL97Lrkjzfg_lm0YBQMQ",
  authDomain: "vampire-s-dream.firebaseapp.com",
  projectId: "vampire-s-dreamvampire-s-dream",
  storageBucket: "vampire-s-dream.firebasestorage.app",
  messagingSenderId: "756289952800",
  appId: "1:756289952800:web:3f53f28f9eab4cbd5f7045"
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title || 'Emergency Blood Alert';
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
