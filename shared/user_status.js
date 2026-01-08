import { auth, db } from "/wauklink-site/shared/firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// Éléments navbar (peuvent ne pas exister selon la page)
const userNav    = document.getElementById("userNav");
const guestNav   = document.getElementById("guestStatus");
const navAvatar  = document.getElementById("navAvatar");
const logoutBtn  = document.getElementById("logoutBtn");

// 🛑 Si aucun bloc concerné, on sort proprement
if (!userNav && !guestNav) {
  console.warn("ℹ️ user_status.js ignoré sur cette page");
} else {

  onAuthStateChanged(auth, async (user) => {
    // 👥 INVITÉ
    if (!user) {
      userNav?.classList.add("hidden");
      guestNav?.classList.remove("hidden");
      return;
    }

    // 👤 CONNECTÉ
    guestNav?.classList.add("hidden");
    userNav?.classList.remove("hidden");

    // 🖼️ AVATAR
    if (navAvatar) {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists() && snap.data().avatarUrl) {
         navAvatar.src = snap.data().avatarUrl + "?t=" + Date.now();
        } else {
          navAvatar.src = "/wauklink-site/assets/avatar-default.png";
        }

      } catch (e) {
        navAvatar.src = "/wauklink-site/assets/avatar-default.png";
      }
    }
  });

  // 🔓 Déconnexion
  logoutBtn?.addEventListener("click", async () => {
    await signOut(auth);
    location.href = "/wauklink-site/auth/login.html";
  });
}
