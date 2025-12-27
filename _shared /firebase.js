// /_shared/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyA6GuK8h2YGbWARC8ybLQa5L06ZcdePM",
  authDomain: "wauklink-9b61f.firebaseapp.com",
  databaseURL: "https://wauklink-9b61f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "wauklink-9b61f",
  storageBucket: "wauklink-9b61f.firebasestorage.app",
  messagingSenderId: "398288789090",
  appId: "1:398288789090:web:82b7c1bcbd4ad47af1fb3b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
