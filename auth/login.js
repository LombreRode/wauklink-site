import { auth } from "/shared/firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const msg = document.getElementById("msg");

  if (!form) {
    console.error("Formulaire loginForm introuvable");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "Connexion…";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      msg.textContent = "Connecté";
      setTimeout(() => {
        location.href = "../index.html";
      }, 500);
    } catch (err) {
      console.error(err);
      msg.textContent = "Email ou mot de passe incorrect";
    }
  });
});
