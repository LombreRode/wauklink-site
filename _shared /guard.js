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
  } catch (e) {
    console.error(e);
    return "user";
  }
}

export function requireModeration({
  redirectTo,
  onLoading,
  onOk,
  onFail
}) {
  onLoading?.();

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      onFail?.("not-auth");
      return (location.href = redirectTo);
    }

    const role = await getRole(user.uid);

    if (role === "admin" || role === "moderator") {
      onOk?.(user, role);
    } else {
      onFail?.("forbidden", role);
      location.href = redirectTo;
    }
  });
}
