import { auth, db } from "../_shared/firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  // Pas connecté → login
  if (!user) {
    location.href = "../auth/login.html";
    return;
  }

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  // Doc user manquant → questionnaire
  if (!snap.exists()) {
    location.href = "../auth/profile.html";
    return;
  }

  const data = snap.data();

  // Profil pas complété → questionnaire
  if (!data.profile || data.profile.completed !== true) {
    location.href = "../auth/profile.html";
    return;
  }

  // Sinon → dashboard
  // (NE FAIT RIEN, laisse la page courante)
});
