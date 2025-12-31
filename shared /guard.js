// shared/guard.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* =========================
   AUTH SIMPLE (connecté)
========================= */
export function requireAuth({ redirectTo }) {
  const unsub = onAuthStateChanged(auth, (user) => {
    unsub();
    if (!user) {
      location.replace(redirectTo);
    }
  });
}

/* =========================
   USER (profil Firestore requis)
========================= */
export function requireUser({ redirectTo, onOk }) {
  const unsub = onAuthStateChanged(auth, async (user) => {
    unsub();
    if (!user) {
      location.replace(redirectTo);
      return;
    }
    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) {
      location.replace(redirectTo);
      return;
    }
    onOk?.(user, snap.data());
  });
}

/* =========================
   ADMIN
========================= */
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
      if (snap.data().role === "admin") {
        onOk?.(user, snap.data());
      } else {
        location.replace(redirectTo);
      }
    } catch (err) {
      console.error("Guard admin error:", err);
      location.replace(redirectTo);
    }
  });
}

/* =========================
   MODERATOR (admin OU moderator)
========================= */
export function requireModerator({ redirectTo, onOk }) {
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
      if (role === "admin" || role === "moderator") {
        onOk?.(user, snap.data());
      } else {
        location.replace(redirectTo);
      }
    } catch (err) {
      console.error("Guard moderator error:", err);
      location.replace(redirectTo);
    }
  });
}
