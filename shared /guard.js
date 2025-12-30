// shared/guard.js
import { auth, db } from "/wauklink-site/shared/firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

async function getRole(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data().role : "user";
}

export function requireAdmin({ redirectTo, onOk }) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      location.replace(redirectTo);
      return;
    }

    const role = await getRole(user.uid);

    if (role === "admin") {
      onOk?.(user);
    } else {
      location.replace(redirectTo);
    }
  });
}
