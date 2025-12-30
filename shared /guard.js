// shared/guard.js
import { auth, db } from "./firebase.js";

import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import { doc, getDoc } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

export function requireAdmin({ redirectTo, onOk }) {
  const unsub = onAuthStateChanged(auth, async (user) => {
    unsub();

    if (!user) {
      location.replace(redirectTo);
      return;
    }

    try {
      const snap = await getDoc(doc(db, "users", user.uid));

      if (!snap.exists()) {
        location.replace(redirectTo);
        return;
      }

      const role = snap.data().role;

      if (role === "admin") {
        onOk?.(user);
      } else {
        location.replace(redirectTo);
      }

    } catch (err) {
      console.error("Guard error:", err);
      location.replace(redirectTo);
    }
  });
}
