// auth/user_sync.js
import { auth, db } from "../shared/firebase.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

let lastUid = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    lastUid = null;
    return;
  }

  if (lastUid === user.uid) return;
  lastUid = user.uid;

  try {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      console.warn("⚠️ Profil Firestore manquant pour", user.uid);
      return;
    }

    // 🔕 PAS de user global
    // 🔕 PAS de rôle exposé
    // 🔕 PAS de logique d’accès ici

    // Mise à jour légère (optionnelle mais propre)
    await updateDoc(ref, {
      lastLoginAt: serverTimestamp()
    });

  } catch (err) {
    console.error("❌ user_sync error:", err);
  }
});
