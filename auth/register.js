// auth/register.js
import { auth, db } from "../_shared/firebase.js";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const msg = document.getElementById("msg");
  const email = document.getElementById("email");
  const password = document.getElementById("password");

  if (!form || !email || !password || !msg) {
    console.error("❌ Formulaire d'inscription introuvable dans le DOM");
    return;
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.location.href = "../index.html";
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "Création du compte…";

    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.value.trim(),
        password.value.trim()
      );

      await setDoc(doc(db, "users", cred.user.uid), {
        email: cred.user.email,
        role: "user",
        createdAt: serverTimestamp()
      });

      window.location.href = "../index.html";
    } catch (err) {
      console.error(err);
      msg.textContent = "❌ " + err.message;
    }
  });
});
