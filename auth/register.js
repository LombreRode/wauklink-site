console.log("✅ register.js chargé");
import { auth, db } from "../shared/firebase.js";

import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ register.js chargé");

  const form = document.getElementById("form");
  const msg  = document.getElementById("msg");

  if (!form) {
    console.error("❌ Formulaire #form introuvable");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("🟢 Submit déclenché");

    // 🔐 CHECKBOX LÉGALES
    const privacy = document.getElementById("acceptPrivacy");
    const cgu     = document.getElementById("acceptCgu");
    const legal   = document.getElementById("acceptLegal");
    const adult   = document.getElementById("isAdult");

    if (!privacy || !cgu || !legal || !adult) {
      msg.textContent = "❌ Case obligatoire manquante";
      return;
    }

    if (!privacy.checked || !cgu.checked || !legal.checked || !adult.checked) {
      msg.textContent =
        "❌ Vous devez accepter la confidentialité, les CGU, les mentions légales et être majeur";
      return;
    }

    // 🧾 DONNÉES FORMULAIRE
    const firstName   = document.getElementById("firstName").value.trim();
    const lastName    = document.getElementById("lastName").value.trim();
    const email       = document.getElementById("email").value.trim();
    const password    = document.getElementById("password").value;
    const confirmPass = document.getElementById("passwordConfirm").value;
    const phone       = document.getElementById("phone")?.value.trim() || "";
    const address     = document.getElementById("address")?.value.trim() || "";
    const postalCode  = document.getElementById("postalCode")?.value.trim() || "";
    const city        = document.getElementById("city")?.value.trim() || "";

    if (!firstName || !lastName || !email || !password) {
      msg.textContent = "❌ Tous les champs obligatoires doivent être remplis";
      return;
    }

    if (password !== confirmPass) {
      msg.textContent = "❌ Les mots de passe ne correspondent pas";
      return;
    }

    msg.textContent = "⏳ Création du compte…";

    try {
      // 🔐 CRÉATION AUTH FIREBASE
      const cred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log("🆔 UID créé :", cred.user.uid);

      // 🗄️ ENREGISTREMENT FIRESTORE
      await setDoc(doc(db, "users", cred.user.uid), {
        firstName,
        lastName,
        email,
        phone,
        address,
        postalCode,
        city,
        role: "user",
        abonnement: { type: "free" },
        legal: {
          privacyAccepted: true,
          cguAccepted: true,
          mentionsAccepted: true,
          isAdult: true,
          acceptedAt: serverTimestamp()
        },
        createdAt: serverTimestamp()
      });

      msg.textContent = "✅ Compte créé avec succès";

      setTimeout(() => {
        window.location.href = "/wauklink-site/index.html";
      }, 1000);

    } catch (err) {
      console.error("❌ Erreur inscription :", err);
      msg.textContent = err.code
        ? "❌ " + err.code
        : "❌ Erreur technique";
    }
  });
});
