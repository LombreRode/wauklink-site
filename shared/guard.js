// shared/guard.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// 🔐 Redirection UNIQUEMENT pour non connecté
function redirectLogin() {
  location.replace("../auth/login.html");
}

/* =========================
   USER
========================= */
export function requireUser({ onOk, onDenied } = {}) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return redirectLogin();

    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists()) {
        onDenied?.("Profil utilisateur introuvable");
        return;
      }
      onOk?.(user, snap.data());
    } catch (e) {
      console.error("requireUser error", e);
      onDenied?.("Erreur de chargement du profil");
    }
  });
}

/* =========================
   ADMIN
========================= */
export function requireAdmin({ onOk, onDenied } = {}) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return redirectLogin();

    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists() || snap.data().role !== "admin") {
        onDenied?.("Accès réservé aux administrateurs");
        return;
      }
      onOk?.(user, snap.data());
    } catch (e) {
      console.error("requireAdmin error", e);
      onDenied?.("Erreur d’accès administrateur");
    }
  });
}

/* =========================
   MODERATOR
========================= */
export function requireModerator({ onOk, onDenied } = {}) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return redirectLogin();

    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      const role = snap.exists() && snap.data().role;

      if (role === "admin" || role === "moderator") {
        onOk?.(user, snap.data());
      } else {
        onDenied?.("Accès réservé à la modération");
      }
    } catch (e) {
      console.error("requireModerator error", e);
      onDenied?.("Erreur d’accès modération");
    }
  });
}
