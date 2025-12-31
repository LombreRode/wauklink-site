import { auth } from "../wauklink-site/shared/firebase.js
import { signInWithEmailAndPassword } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const msg  = document.getElementById("msg");

  if (!form) {
    console.error("❌ Formulaire #loginForm introuvable");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (msg) msg.textContent = "⏳ Connexion…";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (msg) msg.textContent = "✅ Connecté. Redirection…";
      setTimeout(() => {
        location.href = "../index.html";
      }, 600);
    } catch (err) {
      console.error(err);
      if (msg) msg.textContent = "❌ Email ou mot de passe incorrect";
    }
  });
});
