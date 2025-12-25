// admin/_shared/guard.js
import { auth, db } from "../../auth/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

async function getRole(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? String(snap.data()?.role || "") : "";
}

export function requireAdmin(opts = {}) {
  const redirectTo = opts.redirectTo ?? "../index.html";
  const onOk = opts.onOk ?? (() => {});
  const onLoading = opts.onLoading ?? (() => {});

  onLoading(null);

  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      setTimeout(() => (location.href = redirectTo), 300);
      return;
    }

    const role = await getRole(user.uid);

    if (role !== "admin") {
      setTimeout(() => (location.href = redirectTo), 300);
      return;
    }

    await onOk(user);
  });
}
