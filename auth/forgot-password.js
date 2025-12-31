import { auth } from "../shared/firebase.js";
import { sendPasswordResetEmail } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// DOM
const form = document.getElementById("resetForm");
const email = document.getElementById("email");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "Envoi du lien…";
  try {
    await sendPasswordResetEmail(auth, email.value.trim());
    msg.textContent = "✅ Email de réinitialisation envoyé";
  } catch (err) {
    console.error(err);
    msg.textContent = "❌ Adresse email invalide ou erreur";
  }
});
