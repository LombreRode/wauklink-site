import { auth } from "../_shared/firebase.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");

onAuthStateChanged(auth, (user) => {
  if (user) {
    location.href = "../index.html";
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "Connexion…";

  try {
    await signInWithEmailAndPassword(
      auth,
      email.value.trim(),
      password.value.trim()
    );
    location.href = "../index.html";
  } catch (err) {
    msg.textContent = "❌ Email ou mot de passe incorrect";
  }
});
