import { auth } from "../shared/firebase.js";
import { signInWithEmailAndPassword } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");

if (!form || !msg) {
  msg.textContent = "Erreur chargement formulaire";
} else {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    msg.textContent = "Connexion en cours…";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      msg.textContent = "✅ Connexion réussie";
      location.replace("../index.html");
    } catch (err) {
      msg.textContent = "❌ Email ou mot de passe incorrect";
    }
  });
}
