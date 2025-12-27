// _shared/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// ⚠️ REMPLACE AVEC TES VRAIES VALEURS FIREBASE
const firebaseConfig = {
  apiKey: "REMPLACE_API_KEY",
  authDomain: "REMPLACE.firebaseapp.com",
  projectId: "REMPLACE",
  storageBucket: "REMPLACE.appspot.com",
  messagingSenderId: "REMPLACE",
  appId: "REMPLACE"
};

// INIT UNIQUE
const app = initializeApp(firebaseConfig);

// EXPORT SERVICES
export const auth = getAuth(app);
export const db = getFirestore(app);
