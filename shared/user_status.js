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

if (!userNav && !guestNav) {
  console.warn("ℹ️ user_status.js ignoré sur cette page");
} else {
  onAuthStateChanged(auth, async user => {
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
          navAvatar.src =
            snap.data().avatarUrl + "?t=" + Date.now();
        } else {
          navAvatar.src =
            "/wauklink-site/assets/avatar-default.png";
        }
      } catch (e) {
        console.error("avatar load error:", e);
        navAvatar.src =
          "/wauklink-site/assets/avatar-default.png";
      }
    }
  });

  // 🔓 Déconnexion
  logoutBtn?.addEventListener("click", async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("logout error:", err);
    } finally {
      location.href = "/wauklink-site/auth/login.html";
    }
  });
}
