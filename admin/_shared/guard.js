// admin/_shared/guard.js
import { auth, db } from "../../auth/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

async function getRole(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? String(snap.data()?.role || "") : "";
}

export function requireModeration(opts = {}) {
  const redirectTo = opts.redirectTo ?? "../index.html";
  const onOk = opts.onOk ?? (() => {});
  const onLoading = opts.onLoading ?? (() => {});

  onLoading(null);

  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      try { onLoading(null); } catch {}
      setTimeout(() => (location.href = redirectTo), 200);
      return;
    }

    const role = await getRole(user.uid);

    if (!(role === "admin" || role === "moderator")) {
      try { onLoading(user); } catch {}
      setTimeout(() => (location.href = redirectTo), 200);
      return;
    }

    await onOk(user, role);
  });
}
