// _shared/firebase.js
// =====================================
// FIREBASE INIT — APP SAFE / PROD READY
// =====================================

import {
  initializeApp,
  getApps,
  getApp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// ================================
// CONFIG FIREBASE
// ================================
// ⚠️ Remplacer par les vraies valeurs en prod
const firebaseConfig = {
  apiKey: "REMPLACE_API_KEY",
  authDomain: "REMPLACE.firebaseapp.com",
  projectId: "REMPLACE",
  storageBucket: "REMPLACE.appspot.com",
  messagingSenderId: "REMPLACE",
  appId: "REMPLACE"
};

// ================================
// INIT UNIQUE (ANTI DOUBLE INIT)
// ================================
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

// ================================
// EXPORT SERVICES
// ================================
export const auth = getAuth(app);
export const db   = getFirestore(app);
