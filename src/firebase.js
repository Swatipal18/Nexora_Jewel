// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDapZumf_x9fkk56yRDpWfKX8w1eachzSU",
  authDomain: "zyrajewel-3dea0.firebaseapp.com",
  projectId: "zyrajewel-3dea0",
  storageBucket: "zyrajewel-3dea0.appspot.com",
  messagingSenderId: "99540781229",
  appId: "1:99540781229:web:5490172ff333c7423a5e24",
  measurementId: "G-WHR1J912QS"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);

// 👇 Request notification permission and return FCM token
export const getFcmToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission not granted.");
      return null;
    }

    const currentToken = await getToken(messaging, {
      vapidKey: "BOIK7GkYzUYMz8TKrXFG91fesNOhchJZ6uLsXgS6DINkITsFpOHI81oaY6fnHE73nSuB728-nrCa8TAd78J0BB8",
      serviceWorkerRegistration: await navigator.serviceWorker.ready,
    });

    if (currentToken) {
      // console.log("✅ FCM Token:", currentToken);
      return currentToken;
    } else {
      console.warn("⚠️ No registration token available.");
      return null;
    }
  } catch (error) {
    console.error("❌ Error while fetching FCM token", error);
    return null;
  }
};

// 👇 Handle foreground messages
export const onForegroundMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("📩 Foreground Message received: ", payload);
      resolve(payload);
    });
  });
