// auth/user_sync.js
// Crée/MAJ un document Firestore /users/{uid} dès qu'un user est connecté

import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  try {
    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        email: user.email || null,
        displayName: user.displayName || null,
        lastLoginAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (e) {
    // silencieux pour ne pas casser le site
    console.error("user_sync error:", e);
  }
});
