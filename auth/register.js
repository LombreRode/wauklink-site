// auth/register.js

// 🔹 IMPORTS (CHEMINS RELATIFS — OBLIGATOIRE SUR GITHUB PAGES)
import { auth, db } from "../shared/firebase.js";

import { createUserWithEmailAndPassword } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import { doc, setDoc, serverTimestamp } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// 🔹 ELEMENTS DOM
const form = document.getElementById("registerForm");
const msg = document.getElementById("msg");

console.log("REGISTER.JS CHARGÉ");

// 🔹 SUBMIT FORM
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "Création du compte…";

  try {
    // 🔸 RÉCUPÉRATION DES CHAMPS
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const password2 = document.getElementById("password2").value;

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();

    // 🔸 VÉRIFICATIONS
    if (password !== password2) {
      msg.textContent = "❌ Les mots de passe ne correspondent pas";
      return;
    }

    if (
      !document.getElementById("acceptCgu").checked ||
      !document.getElementById("acceptLegal").checked ||
      !document.getElementById("acceptConditions").checked
    ) {
      msg.textContent = "❌ Tu dois accepter toutes les conditions";
      return;
    }

    // 🔹 1️⃣ CRÉATION UTILISATEUR AUTH
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    console.log("AUTH OK :", cred.user.uid);

    // 🔹 2️⃣ CRÉATION DOCUMENT FIRESTORE
    await setDoc(doc(db, "users", cred.user.uid), {
      firstName,
      lastName,
      email: cred.user.email,
      role: "user",
      abonnement: { type: "free" },
      createdAt: serverTimestamp()
    });

    console.log("FIRESTORE OK");

    // 🔹 SUCCÈS
    msg.textContent = "✅ Compte créé";
    setTimeout(() => {
      location.replace("../index.html");
    }, 500);

  } catch (err) {
    console.error("REGISTER ERROR :", err);
    msg.textContent = err.code || err.message || "❌ Erreur création compte";
  }
});
