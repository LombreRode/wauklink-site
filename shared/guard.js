// shared/guard.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/**
 * Redirection si NON connecté
 * @param {string} redirectUrl
 */
export function requireAuth(redirectUrl = "/wauklink-site/auth/login.html") {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      location.href = redirectUrl;
    }
  });
}

/**
 * Redirection si NON admin
 * @param {string} redirectUrl
 */
export function requireAdmin(redirectUrl = "/wauklink-site/index.html") {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      location.href = redirectUrl;
      return;
    }

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists() || snap.data().role !== "admin") {
      location.href = redirectUrl;
    }
  });
}
