// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDapZumf_x9fkk56yRDpWfKX8w1eachzSU",
  authDomain: "zyrajewel-3dea0.firebaseapp.com",
  projectId: "zyrajewel-3dea0",
  storageBucket: "zyrajewel-3dea0.appspot.com",
  messagingSenderId: "99540781229",
  appId: "1:99540781229:web:5490172ff333c7423a5e24",
  measurementId: "G-WHR1J912QS"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const { title, body } = payload.notification;

  self.registration.showNotification(title, {
    body,
    icon: '/zyra-icon.png',
  });
});
