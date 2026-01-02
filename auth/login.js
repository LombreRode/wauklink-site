import { auth } from "../shared/firebase.js";
import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const msg = document.getElementById("msg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    msg.textContent = "⏳ Connexion…";

    try {
      await signInWithEmailAndPassword(
        auth,
        email.value.trim(),
        password.value
      );

      msg.textContent = "✅ Connexion réussie";
      setTimeout(() => {
        location.href = "/wauklink-site/index.html";
      }, 500);

    } catch (err) {
      console.error(err);
      msg.textContent =
        err.code ? "❌ " + err.code : "❌ Erreur de connexion";
    }
  });
});
