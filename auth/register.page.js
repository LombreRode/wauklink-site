// auth/register.page.js
import { auth, db } from "../shared/firebase.js";
import { createUserWithEmailAndPassword } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const form = document.getElementById("form");
const msg  = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "Création du compte…";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    // 1️⃣ Création Auth
    const cred = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // 2️⃣ Création Firestore (CREATE ONLY — conforme aux rules)
    await setDoc(doc(db, "users", cred.user.uid), {
      firstName: "À compléter",
      lastName: "À compléter",
      phone: "0000000000",
      address: "À compléter",
      email: email,
      role: "user",
      abonnement: { type: "free" },
      createdAt: serverTimestamp()
    });

    msg.textContent = "Compte créé ✔";

    setTimeout(() => {
      window.location.href = "../index.html";
    }, 800);

  } catch (err) {
    console.error(err);
    msg.textContent = err.code;
  }
});
