// _shared/guard.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

async function getRole(uid) {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return "user";
    return snap.data().role || "user";
  } catch {
    return "user";
  }
}

export function requireAuth({ redirectTo, onOk }) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = redirectTo;
    } else {
      onOk(user);
    }
  });
}

export function requireAdmin({ redirectTo, onOk }) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return window.location.href = redirectTo;
    const role = await getRole(user.uid);
    if (role === "admin") onOk(user);
    else window.location.href = redirectTo;
  });
}

export function requireModeration({ redirectTo, onOk }) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return window.location.href = redirectTo;
    const role = await getRole(user.uid);
    if (role === "admin" || role === "moderator") onOk(user);
    else window.location.href = redirectTo;
  });
}
