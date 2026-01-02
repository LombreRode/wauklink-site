import { auth, db } from "../shared/firebase.js";
import {
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const form = document.getElementById("form");
const emailEl = document.getElementById("email");
const msg = document.getElementById("msg");

if (!form || !emailEl || !msg) {
  console.error("❌ Éléments DOM manquants");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailEl.value.trim();
  if (!email) {
    msg.textContent = "❌ Veuillez entrer un email.";
    return;
  }

  msg.textContent = "⏳ Envoi en cours…";

  try {
    await sendPasswordResetEmail(auth, email, {
      url: "https://lombredode.github.io/wauklink-site/auth/login.html"
    });

    msg.textContent =
      "✅ Email envoyé. Vérifiez votre boîte de réception.";
    form.reset();

  } catch (err) {
    console.error(err);

    switch (err.code) {
      case "auth/user-not-found":
        msg.textContent =
          "❌ Aucun compte associé à cet email.";
        break;

      case "auth/invalid-email":
        msg.textContent =
          "❌ Adresse email invalide.";
        break;

      default:
        msg.textContent =
          "❌ Erreur lors de l’envoi. Réessayez plus tard.";
    }
  }
});
