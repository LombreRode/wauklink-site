import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// Éléments UI
const loginBtn = document.querySelector(".btn-login");
const signupLinks = document.querySelectorAll(".signup-link");
const dashboardBtn = document.querySelector(".btn-dashboard");
const logoutBtn = document.getElementById("logoutBtn");
const freeCard = document.querySelector(".free-card");

// État de connexion
onAuthStateChanged(auth, (user) => {
  if (user) {
    // 🔒 Utilisateur connecté
    loginBtn?.classList.add("hidden");
    signupLinks.forEach(el => el.classList.add("hidden"));
    dashboardBtn?.classList.remove("hidden");
    logoutBtn?.classList.remove("hidden");

    // Carte Gratuit → Dashboard
    if (freeCard) {
      freeCard.href = "./dashboard/index.html";
    }

  } else {
    // 👤 Visiteur
    loginBtn?.classList.remove("hidden");
    signupLinks.forEach(el => el.classList.remove("hidden"));
    dashboardBtn?.classList.add("hidden");
    logoutBtn?.classList.add("hidden");

    // Carte Gratuit → Inscription
    if (freeCard) {
      freeCard.href = "./auth/register.html";
    }
  }
});

// Déconnexion
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "./index.html";
  });
}
