import { initializeApp, getApps, getApp } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { getStorage } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyA6GuK8h2YGgbWaRC8ybBlQa5LO67cdePM",
  authDomain: "wauklink-9b61f.firebaseapp.com",
  projectId: "wauklink-9b61f",
  storageBucket: "wauklink-9b61f.firebasestorage.app"
  messagingSenderId: "398288789090",
  appId: "1:398288789090:web:82b7c1cbcd4ad47af1fb3b"
};

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
