// auth/login.js
import { auth } from "/wauklink-site/shared/firebase.js";
import { signInWithEmailAndPassword } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "Connexion…";

  try {
    await signInWithEmailAndPassword(
      auth,
      email.value.trim(),
      password.value
    );

    // ✅ Connexion OK → accueil
    location.replace("/wauklink-site/index.html");

  } catch (err) {
    msg.textContent = "❌ Identifiants incorrects";
  }
});
