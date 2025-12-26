import { auth, db } from "../../auth/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

async function getRole(uid) {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? String(snap.data()?.role || "") : "";
  } catch (e) {
    console.error("getRole error:", e);
    return "";
  }
}

export function requireModeration(opts = {}) {
  const redirectTo = opts.redirectTo ?? "../index.html";
  const onOk = opts.onOk ?? (() => {});
  const onLoading = opts.onLoading ?? (() => {});

  onLoading(null);

  return onAuthStateChanged(auth, async (user) => {
    if (!user) return location.replace(redirectTo);

    const role = await getRole(user.uid);
    if (!(role === "admin" || role === "moderator")) return location.replace(redirectTo);

    return onOk(user, role);
  });
}
