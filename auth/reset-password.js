import { auth, db } from "../shared/firebase.js";
import {
  verifyPasswordResetCode,
  confirmPasswordReset
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const form = document.getElementById("form");
const passwordEl = document.getElementById("password");
const msg = document.getElementById("msg");

// 🔑 récupérer le code depuis l’URL
const params = new URLSearchParams(location.search);
const oobCode = params.get("oobCode");

if (!oobCode) {
  msg.textContent = "❌ Lien invalide.";
  form.style.display = "none";
}

form.addEventListener("submit", async e => {
  e.preventDefault();
  const password = passwordEl.value.trim();

  if (password.length < 6) {
    msg.textContent =
      "❌ Mot de passe trop court (6 caractères minimum).";
    return;
  }

  msg.textContent = "⏳ Mise à jour du mot de passe…";

  try {
    await verifyPasswordResetCode(auth, oobCode);
    await confirmPasswordReset(auth, oobCode, password);

    msg.textContent =
      "✅ Mot de passe modifié. Redirection…";

    // 🔁 REDIRECTION AUTO
    setTimeout(() => {
      location.href = "./login.html";
    }, 2000);

  } catch (err) {
    console.error(err);
    msg.textContent =
      "❌ Lien expiré ou invalide.";
  }
});
