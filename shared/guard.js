// shared/guard.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

function safeRedirect(to) {
  location.replace(to || "/auth/login.html");
}

/* =========================
   AUTH SIMPLE (connecté)
========================= */
export function requireUser({ redirectTo, onOk } = {}) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      return location.replace(redirectTo);
    }

    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists()) {
        return location.replace(redirectTo);
      }
      onOk?.(user, snap.data());
    } catch {
      location.replace(redirectTo);
    }
  });
}

/* =========================
   USER (profil Firestore requis)
========================= */
export function requireUser({ redirectTo, onOk } = {}) {
  const unsub = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      unsub();
      return safeRedirect(redirectTo);
    }

    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      unsub();

      if (!snap.exists()) {
        return safeRedirect(redirectTo);
      }

      onOk?.(user, snap.data());
    } catch (e) {
      console.error("requireUser error", e);
      unsub();
      safeRedirect(redirectTo);
    }
  });
}

/* =========================
   ADMIN
========================= */
export function requireAdmin({ redirectTo, onOk } = {}) {
  const unsub = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      unsub();
      return safeRedirect(redirectTo);
    }

    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      unsub();

      if (!snap.exists() || snap.data().role !== "admin") {
        return safeRedirect(redirectTo);
      }

      onOk?.(user, snap.data());
    } catch (e) {
      console.error("requireAdmin error", e);
      unsub();
      safeRedirect(redirectTo);
    }
  });
}

/* =========================
   MODERATOR (admin OU moderator)
========================= */
export function requireModerator({ redirectTo, onOk } = {}) {
  const unsub = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      unsub();
      return safeRedirect(redirectTo);
    }

    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      unsub();

      const role = snap.exists() && snap.data().role;
      if (role === "admin" || role === "moderator") {
        onOk?.(user, snap.data());
      } else {
        safeRedirect(redirectTo);
      }
    } catch (e) {
      console.error("requireModerator error", e);
      unsub();
      safeRedirect(redirectTo);
    }
  });
}
