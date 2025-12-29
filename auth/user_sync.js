// auth/user_sync.js
// =====================================
// USER FIRESTORE SYNC (APP SAFE)
// =====================================

import { auth, db } from "/wauklink-site/_shared/firebase.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

let lastSyncedUid = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    lastSyncedUid = null;
    return;
  }

  // éviter les doubles écritures
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
  } catch (err) {
    console.error("❌ user_sync error:", err);
  }
});
