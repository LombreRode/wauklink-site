import { auth } from "../wauklink-site/shared/firebase.js
import { sendPasswordResetEmail } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("forgotForm");
  const msg  = document.getElementById("msg");

  if (!form) {
    console.error("❌ Formulaire #forgotForm introuvable");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "Envoi du lien…";

    const email = document.getElementById("email").value.trim();

    try {
      await sendPasswordResetEmail(auth, email);
      msg.textContent = "✅ Email de réinitialisation envoyé";
    } catch (err) {
      console.error(err);
      if (err.code === "auth/user-not-found") {
        msg.textContent = "❌ Aucun compte avec cet email";
      } else if (err.code === "auth/invalid-email") {
        msg.textContent = "❌ Email invalide";
      } else {
        msg.textContent = "❌ Erreur lors de l’envoi";
      }
    }
  });
});
