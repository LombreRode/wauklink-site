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
  const form = document.getElementById("form");
  const msg = document.getElementById("msg");
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const postalCode = document.getElementById("postalCode").value.trim();
  const city = document.getElementById("city").value.trim();


  if (!form) {
    console.error("Formulaire introuvable");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const privacy = document.getElementById("acceptPrivacy");
    const cgu = document.getElementById("acceptCgu");
    const legal = document.getElementById("acceptLegal");
    const adult = document.getElementById("isAdult");

    if (!privacy || !cgu || !legal || !adult) {
      msg.textContent = "❌ Case manquante dans le formulaire";
      return;
    }

    if (!privacy.checked || !cgu.checked || !legal.checked || !adult.checked) {
      msg.textContent = "❌ Vous devez accepter toutes les conditions";
      return;
    }

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("passwordConfirm").value;

    if (password !== confirm) {
      msg.textContent = "❌ Les mots de passe ne correspondent pas";
      return;
    }

    msg.textContent = "⏳ Création du compte…";

    try {
      const cred =
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

      msg.textContent = "✅ Compte créé";
    } catch (err) {
      console.error(err);
      msg.textContent =
        err.code ? "❌ " + err.code : "❌ Erreur inconnue";
    }
  });
});
