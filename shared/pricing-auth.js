// shared/pricing-auth.js
import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

/* ========= DOM ========= */
const loginBtn = document.querySelector(".btn-login");
const signupLinks = document.querySelectorAll(".signup-link");
const dashboardBtn = document.querySelector(".btn-dashboard");
const logoutBtn = document.getElementById("logoutBtn");
const freeCard = document.querySelector(".free-card");

/* ========= PATHS ========= */
const PATHS = {
  dashboard: "/wauklink-site/dashboard/index.html",
  register: "/wauklink-site/auth/register.html",
  home: "/wauklink-site/index.html"
};

/* ========= AUTH STATE ========= */
onAuthStateChanged(auth, user => {
  if (user) {
    // 🔒 Connecté
    loginBtn?.classList.add("hidden");
    signupLinks.forEach(el => el.classList.add("hidden"));
    dashboardBtn?.classList.remove("hidden");
    logoutBtn?.classList.remove("hidden");

    if (freeCard) {
      freeCard.href = PATHS.dashboard;
    }
  } else {
    // 👤 Visiteur
    loginBtn?.classList.remove("hidden");
    signupLinks.forEach(el => el.classList.remove("hidden"));
    dashboardBtn?.classList.add("hidden");
    logoutBtn?.classList.add("hidden");

    if (freeCard) {
      freeCard.href = PATHS.register;
    }
  }
});

/* ========= LOGOUT ========= */
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("logout error:", err);
    } finally {
      window.location.href = PATHS.home;
    }
  });
}
