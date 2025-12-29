// auth/status.js
import { auth } from "../_shared/firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// ⚠️ STATUS = INFO UNIQUEMENT
// ❌ AUCUNE redirection ici
// ❌ AUCUN accès Firestore
// ✅ Compatible pages publiques (home)

onAuthStateChanged(auth, (user) => {
  if (!user) {
    console.log("👤 visiteur non connecté");
    return;
  }

  console.log("✅ utilisateur connecté :", user.uid);
});
