import { auth } from "../shared/firebase.js";
import { sendPasswordResetEmail } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// DOM
const form = document.getElementById("resetForm");
const email = document.getElementById("email");
const msg = document.getElementById("msg");

if (!form || !email) {
  console.error("resetForm ou email introuvable");
} else {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (msg) msg.textContent = "Envoi du lien…";

    try {
      await sendPasswordResetEmail(auth, email.value.trim());
      if (msg) msg.textContent = "✅ Email de réinitialisation envoyé";
    } catch (err) {
      console.error(err);
      if (msg) msg.textContent = "❌ Adresse email invalide ou erreur";
    }
  });
}
