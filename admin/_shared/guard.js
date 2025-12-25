// admin/_shared/guard.js
// Protection admin (UID) + helpers

import { auth } from "../../auth/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// ✅ Mets ici tous les UID admins (tu peux en ajouter d'autres plus tard)
const ADMIN_UIDS = ["0SWx4JAKvOdvJ6vck7sB6FFeYu22"];

export function isAdminUser(user) {
  return !!user && ADMIN_UIDS.includes(user.uid);
}

/**
 * Protège une page admin :
 * - si pas connecté -> redirige
 * - si pas admin -> redirige
 * - sinon -> appelle onOk(user)
 *
 * @param {Object} opts
 * @param {string} opts.redirectTo URL de redirection (par défaut ../index.html)
 * @param {(user:any)=>void|Promise<void>} opts.onOk callback quand admin OK
 * @param {(user:any)=>void} opts.onLoading callback pendant la vérif (optionnel)
 */
export function requireAdmin(opts = {}) {
  const redirectTo = opts.redirectTo ?? "../index.html";
  const onOk = opts.onOk ?? (() => {});
  const onLoading = opts.onLoading ?? (() => {});

  onLoading(null);

  return onAuthStateChanged(auth, async (user) => {
    // Pas connecté
    if (!user) {
      try { onLoading(null); } catch {}
      setTimeout(() => (location.href = redirectTo), 300);
      return;
    }

    // Pas admin
    if (!isAdminUser(user)) {
      try { onLoading(user); } catch {}
      setTimeout(() => (location.href = redirectTo), 300);
      return;
    }

    // Admin OK
    await onOk(user);
  });
}

/**
 * Optionnel : renvoie l'UID admin list (si tu veux l'afficher)
 */
export function getAdminUids() {
  return [...ADMIN_UIDS];
}
