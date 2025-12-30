// auth/status.js
import { auth } from "/wauklink-site/shared/firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// ⚠️ Script informatif uniquement
// ❌ Pas de redirection
// ❌ Pas de Firestore
// ❌ Pas de rôle

onAuthStateChanged(auth, (user) => {
  if (user) {
    // utilisateur connecté
    document.body.classList.add("user-logged");
  } else {
    // visiteur
    document.body.classList.remove("user-logged");
  }
});
