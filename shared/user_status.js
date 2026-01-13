// shared/user_status.js
import { auth, db } from "/wauklink-site/shared/firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const userNav   = document.getElementById("userNav");
const guestNav  = document.getElementById("guestStatus");
const navAvatar = document.getElementById("navAvatar");
const logoutBtn = document.getElementById("logoutBtn");

onAuthStateChanged(auth, async (user) => {
  if (user) {
    // 👤 MODE CONNECTÉ
    guestNav?.classList.add("hidden");
    userNav?.classList.remove("hidden");

    if (navAvatar) {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const data = snap.exists() ? snap.data() : null;

        if (data && data.avatarUrl) {
          // Affiche la photo de profil (ex: Giorno ou le verre de vin)
          navAvatar.src = data.avatarUrl + "?t=" + Date.now();
        } else {
          // Affiche ton nouveau fichier dans le dossier assets
          navAvatar.src = "/wauklink-site/assets/avatar-default.png";
        }
      } catch (e) {
        console.error("Erreur avatar:", e);
        navAvatar.src = "/wauklink-site/assets/avatar-default.png";
      }
    }
  } else {
    // 👥 MODE INVITÉ
    userNav?.classList.add("hidden");
    guestNav?.classList.remove("hidden");
  }
});

// 🔓 Gestion de la déconnexion
logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "/wauklink-site/auth/login.html";
});
