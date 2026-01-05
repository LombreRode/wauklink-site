// =================================================
// WAUKLINK — Firebase central (OFFICIEL)
// Compatible GitHub Pages
// =================================================

import { initializeApp, getApps, getApp } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import { getAuth } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import { getFirestore } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// =========================
// CONFIG FIREBASE (VRAIE)
// =========================
const firebaseConfig = {
 const firebaseConfig = {
  apiKey: "AIzaSyA6GuK8h2YGgbWaRC8ybBLQa5L06ZcdePM",
  authDomain: "wauklink-9b61f.firebaseapp.com",
  projectId: "wauklink-9b61f",
  storageBucket: "wauklink-9b61f.appspot.com",
  messagingSenderId: "398288789090",
  appId: "1:398288789090:web:82b7c1cbcd4ad47af1fb3b"
};

// =========================
// INIT UNIQUE
// =========================
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

// =========================
// EXPORTS
// =========================
export const auth = getAuth(app);
export const db   = getFirestore(app);
