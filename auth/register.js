// auth/register.js
// ================================
// REGISTER — APP SAFE
// ================================

import { auth } from "../_shared/firebase.js";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const form = document.getElementById("registerForm");
const msg  = document.getElementById("msg");

// Si déjà connecté → retour accueil
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "../index.html";
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "Création du compte…";

  try {
    await createUserWithEmailAndPassword(
      auth,
      email.value.trim(),
      password.value.trim()
    );

    // Redirection après création
    window.location.href = "../index.html";

  } catch (err) {
    msg.textContent = "❌ " + (err.message || "Erreur d’inscription");
  }
});
