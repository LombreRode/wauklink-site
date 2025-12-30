// auth/user_sync.js
import { auth, db } from "/wauklink-site/shared/firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

let lastSyncedUid = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    lastSyncedUid = null;
    return;
  }

  // ⛔ éviter double écriture
  if (lastSyncedUid === user.uid) return;
  lastSyncedUid = user.uid;

  try {
    await setDoc(
      doc(db, "users", user.uid),
      {
        email: user.email,
        lastLoginAt: serverTimestamp()
      },
      { merge: true }
    );
  } catch {
    // silencieux en prod
  }
});
