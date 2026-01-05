// shared/guard.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

function safeRedirect(to) {
  location.replace(to || "../auth/login.html");
}

/* =========================
   USER (profil Firestore requis)
========================= */
export function requireUser({ redirectTo, onOk } = {}) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      return safeRedirect(redirectTo);
    }

    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists()) {
        return safeRedirect(redirectTo);
      }
      onOk?.(user, snap.data());
    } catch (e) {
      console.error("requireUser error", e);
      safeRedirect(redirectTo);
    }
  });
}

/* =========================
   ADMIN
========================= */
export function requireAdmin({ redirectTo, onOk } = {}) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      return safeRedirect(redirectTo);
    }

    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists() || snap.data().role !== "admin") {
        return safeRedirect(redirectTo);
      }
      onOk?.(user, snap.data());
    } catch (e) {
      console.error("requireAdmin error", e);
      safeRedirect(redirectTo);
    }
  });
}

/* =========================
   MODERATOR
========================= */
export function requireModerator({ redirectTo, onOk } = {}) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      return safeRedirect(redirectTo);
    }

    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      const role = snap.exists() && snap.data().role;
      if (role === "admin" || role === "moderator") {
        onOk?.(user, snap.data());
      } else {
        safeRedirect(redirectTo);
      }
    } catch (e) {
      console.error("requireModerator error", e);
      safeRedirect(redirectTo);
    }
  });
}

