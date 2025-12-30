// auth/login.js

// 🔥 IMPORT FIREBASE (CHEMIN RELATIF)
import { auth } from "../shared/firebase.js";
import { signInWithEmailAndPassword } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// 🔗 DOM
const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
const msg = document.getElementById("msg");

// 🔐 SUBMIT
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "Connexion…";

  try {
    await signInWithEmailAndPassword(
      auth,
      email.value.trim(),
      password.value
    );

    // ✅ Connexion OK → accueil (ou dashboard plus tard)
    location.replace("/wauklink-site/index.html");

  } catch (err) {
    console.error(err);
    msg.textContent = "❌ Email ou mot de passe incorrect";
  }
});
