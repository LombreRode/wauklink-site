// shared/guard.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

alert("GUARD.JS CHARGÉ");

async function getRole(uid) {
  alert("LECTURE ROLE POUR UID : " + uid);
  const snap = await getDoc(doc(db, "users", uid));
  alert("DOC EXISTE = " + snap.exists());
  return snap.exists() ? snap.data().role : "user";
}

export function requireAdmin({ redirectTo, onOk }) {
  onAuthStateChanged(auth, async (user) => {
    alert("AUTH STATE CHANGÉ");

    if (!user) {
      alert("PAS CONNECTÉ → REDIRECT");
      location.replace(redirectTo);
      return;
    }

    alert("CONNECTÉ UID = " + user.uid);

    const role = await getRole(user.uid);
    alert("ROLE LU = " + role);

    if (role === "admin") {
      alert("ADMIN OK");
      onOk?.(user);
    } else {
      alert("PAS ADMIN → REDIRECT");
      location.replace(redirectTo);
    }
  });
}
