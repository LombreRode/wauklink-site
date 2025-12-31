// auth/login.js
import { auth } from "../shared/firebase.js";
import { signInWithEmailAndPassword } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const form = document.getElementById("loginForm");
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

    // redirection après login
    location.replace("../index.html");

  } catch (err) {
    console.error(err);
    msg.textContent = "❌ Email ou mot de passe incorrect";
  }
});
