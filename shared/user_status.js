import { auth } from "/wauklink-site/shared/firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const userNav   = document.getElementById("userNav");
const guestNav  = document.getElementById("guestStatus");
const userEmail = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");

// 🛑 Sécurité : si les éléments n’existent pas, on sort
if (!userNav && !guestNav) {
  console.warn("ℹ️ user_status.js ignoré sur cette page");
} else {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      guestNav?.classList.add("hidden");
      userNav?.classList.remove("hidden");

      if (userEmail) {
        userEmail.textContent = user.email;
      }
    } else {
      userNav?.classList.add("hidden");
      guestNav?.classList.remove("hidden");
    }
  });

  logoutBtn?.addEventListener("click", async () => {
    await signOut(auth);
    location.href = "/wauklink-site/auth/login.html";
  });
}
