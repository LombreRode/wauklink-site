import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "XXX",
  authDomain: "XXX.firebaseapp.com",
  projectId: "XXX",
  storageBucket: "XXX.appspot.com",
  messagingSenderId: "XXX",
  appId: "XXX"
};

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
