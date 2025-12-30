import { auth } from "/wauklink-site/shared/firebase.js";
import { signInWithEmailAndPassword } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "Connexion…";

  try {
    await signInWithEmailAndPassword(
      auth,
      email.value.trim(),
      password.value
    );
    location.replace("/wauklink-site/index.html");
  } catch {
    msg.textContent = "❌ Email ou mot de passe incorrect";
  }
});
