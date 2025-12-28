// auth/register.js
import { auth } from "../_shared/firebase.js";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const form = document.getElementById("registerForm");
const msg = document.getElementById("msg");
const email = document.getElementById("email");
const password = document.getElementById("password");

// Si déjà connecté → accueil
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
    msg.textContent = "✅ Compte créé";
    window.location.href = "../index.html";
  } catch (err) {
    console.error(err);
    msg.textContent = "❌ " + err.message;
  }
});
