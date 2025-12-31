// auth/user_sync.js

import { auth, db } from "../shared/firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// Empêche les écritures multiples
let lastSyncedUid = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    lastSyncedUid = null;
    return;
  }

  // évite double exécution
  if (lastSyncedUid === user.uid) return;
  lastSyncedUid = user.uid;

  try {
    await setDoc(
      doc(db, "users", user.uid),
      {
        email: user.email ?? null,
        lastLoginAt: serverTimestamp()
      },
      { merge: true }
    );
  } catch (err) {
    console.error("user_sync error:", err);
  }
});
