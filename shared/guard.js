// shared/guard.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* =========================
   CONFIG
========================= */
const LOGIN_URL = "/wauklink-site/auth/login.html";

/* =========================
   HELPERS
========================= */
function redirectLogin() {
  location.replace(LOGIN_URL);
}

async function getProfile(user) {
  const snap = await getDoc(doc(db, "users", user.uid));
  return snap.exists() ? snap.data() : null;
}

/* =========================
   USER
========================= */
export function requireUser({ onOk, onDenied } = {}) {
  onAuthStateChanged(auth, async user => {
    if (!user) return redirectLogin();
    try {
      const profile = await getProfile(user);
      if (!profile) {
        onDenied?.("Profil utilisateur introuvable");
        return;
      }
      onOk?.(user, profile);
    } catch (e) {
      console.error("requireUser error:", e);
      onDenied?.("Erreur de chargement du profil");
    }
  });
}

/* =========================
   ADMIN
========================= */
export function requireAdmin({ onOk, onDenied } = {}) {
  onAuthStateChanged(auth, async user => {
    if (!user) return redirectLogin();
    try {
      const profile = await getProfile(user);
      if (!profile || profile.role !== "admin") {
        onDenied?.("Accès réservé aux administrateurs");
        return;
      }
      onOk?.(user, profile);
    } catch (e) {
      console.error("requireAdmin error:", e);
      onDenied?.("Erreur d’accès administrateur");
    }
  });
}

/* =========================
   MODERATOR
========================= */
export function requireModerator({ onOk, onDenied } = {}) {
  onAuthStateChanged(auth, async user => {
    if (!user) return redirectLogin();
    try {
      const profile = await getProfile(user);
      if (!profile) {
        onDenied?.("Profil introuvable");
        return;
      }
      if (profile.role === "admin" || profile.role === "moderator") {
        onOk?.(user, profile);
      } else {
        onDenied?.("Accès réservé à la modération");
      }
    } catch (e) {
      console.error("requireModerator error:", e);
      onDenied?.("Erreur d’accès modération");
    }
  });
}
