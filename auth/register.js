import { auth, db } from "../_shared/firebase.js";
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const form = document.getElementById("registerForm");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "Création du compte…";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const cred = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Création du document user MINIMAL
    await setDoc(doc(db, "users", cred.user.uid), {
      email,
      role: "user",
      profile: { completed: false },
      createdAt: serverTimestamp()
    });

    // Redirection vers questionnaire
    location.href = "./profile.html";

  } catch (err) {
    console.error(err);
    msg.textContent = err.message || "Erreur lors de l’inscription";
  }
});
