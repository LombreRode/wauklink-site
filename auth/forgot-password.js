import { auth } from "/wauklink-site/shared/firebase.js";
import {
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const form = document.getElementById("form");
const emailEl = document.getElementById("email");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "⏳ Envoi en cours…";

  try {
    await sendPasswordResetEmail(auth, emailEl.value.trim(), {
      url: "https://lombredode.github.io/wauklink-site/auth/login.html"
    });

    msg.textContent =
      "✅ Email envoyé. Vérifiez votre boîte de réception.";
    form.reset();
  } catch (err) {
    console.error(err);

    if (err.code === "auth/user-not-found") {
      msg.textContent =
        "❌ Aucun compte associé à cet email.";
    } else if (err.code === "auth/invalid-email") {
      msg.textContent =
        "❌ Adresse email invalide.";
    } else {
      msg.textContent =
        "❌ Erreur lors de l’envoi. Réessayez.";
    }
  }
});
