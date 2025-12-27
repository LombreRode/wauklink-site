// /_shared/guard.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

async function getRole(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? String(snap.data()?.role || "") : "";
}

// GUARD ADMIN / MODERATOR
export function requireModeration(opts = {}) {
  const redirectTo = opts.redirectTo ?? "../index.html";
  const onOk = opts.onOk ?? (() => {});
  const onFail = opts.onFail ?? (() => {});
  const onLoading = opts.onLoading ?? (() => {});

  onLoading();

  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      onFail("NOT_LOGGED");
      return location.replace(redirectTo);
    }

    let role = "";
    try {
      role = await getRole(user.uid);
    } catch (e) {
      console.error("getRole error:", e);
    }

    if (role !== "admin" && role !== "moderator") {
      onFail("NO_ROLE", role);
      return location.replace(redirectTo);
    }

    onOk(user, role);
  });
}
