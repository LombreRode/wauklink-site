import { auth } from "../shared/firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
const msg = document.getElementById("msg");

// 🔐 Si déjà connecté → retour accueil (ou dashboard)
onAuthStateChanged(auth, (user) => {
  if (user) {
    location.replace("../index.html");
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "Connexion…";

  try {
    await signInWithEmailAndPassword(
      auth,
      email.value.trim(),
      password.value
    );

    // ✅ Connexion OK
    location.replace("../index.html");

  } catch (err) {
    console.error(err);
    msg.textContent = "❌ Identifiants incorrects";
  }
});
