import { auth } from "./firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const loginBtn = document.querySelector(".btn-login");
const signupLinks = document.querySelectorAll(".signup-link");
const dashboardBtn = document.querySelector(".btn-dashboard");
const logoutBtn = document.querySelector(".btn-logout");

onAuthStateChanged(auth, (user) => {
  if (user) {// 🔁 Rediriger la carte "Gratuit" si connecté
const freeCard = document.querySelector(".free-card");
if (user && freeCard) {
  freeCard.href = "./dashboard/index.html";
}
    // 🔒 Utilisateur connecté
    loginBtn?.classList.add("hidden");
    signupLinks.forEach(el => el.classList.add("hidden"));
    dashboardBtn?.classList.remove("hidden");
    logoutBtn?.classList.remove("hidden");
  } else {
    // 👤 Visiteur
    loginBtn?.classList.remove("hidden");
    signupLinks.forEach(el => el.classList.remove("hidden"));
    dashboardBtn?.classList.add("hidden");
    logoutBtn?.classList.add("hidden");
  }
});
