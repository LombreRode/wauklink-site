import { auth, db } from "/wauklink-site/shared/firebase.js";
import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ login.js chargé");

  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const msg = document.getElementById("msg");

  if (!form || !emailInput || !passwordInput || !msg) {
    console.error("❌ Élément login manquant");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      msg.textContent = "❌ Email et mot de passe requis";
      return;
    }

    msg.textContent = "⏳ Connexion…";

    try {
      await signInWithEmailAndPassword(auth, email, password);
      msg.textContent = "✅ Connexion réussie";

      setTimeout(() => {
        window.location.href = "/wauklink-site/index.html";
      }, 500);

    } catch (err) {
      console.error("❌ Erreur login :", err);

      let message = "❌ Erreur de connexion";
      if (err.code === "auth/user-not-found") message = "❌ Compte introuvable";
      if (err.code === "auth/wrong-password") message = "❌ Mot de passe incorrect";
      if (err.code === "auth/invalid-email") message = "❌ Email invalide";

      msg.textContent = message;
    }
  });
});
