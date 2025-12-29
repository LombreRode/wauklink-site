// auth/status.js
import { auth, db } from "../_shared/firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  // ❌ Pas connecté → login
  if (!user) {
    location.href = "../auth/login.html";
    return;
  }

  try {
    const snap = await getDoc(doc(db, "users", user.uid));

    // ❌ Pas de document ou profil incomplet → questionnaire
    if (!snap.exists() || snap.data().profile?.completed !== true) {
      location.href = "../auth/profile.html";
      return;
    }

    // ✅ Tout est OK → on laisse la page continuer
  } catch (e) {
    console.error("status.js error:", e);
    location.href = "../auth/login.html";
  }
});
