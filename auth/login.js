import { auth } from "../_shared/firebase.js";
import { signInWithEmailAndPassword } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "Connexion…";

  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    location.replace("../index.html");
  } catch {
    msg.textContent = "❌ Identifiants incorrects";
  }
});
