import { auth, db } from "../shared/firebase.js";
import { createUserWithEmailAndPassword } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const form = document.getElementById("registerForm");
const msg = document.getElementById("msg");

if (!form) {
  console.error("registerForm introuvable");
} else {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (msg) msg.textContent = "Création du compte…";

    // Champs de base
    const firstName = document.getElementById("firstName")?.value.trim();
    const lastName = document.getElementById("lastName")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value;
    const password2 = document.getElementById("password2")?.value;

    // Champs métier
    const phone = document.getElementById("phone")?.value.trim();
    const address = document.getElementById("address")?.value.trim();
    const address2 = document.getElementById("address2")?.value.trim();

    // Vérifications obligatoires
    if (!firstName || !lastName || !email || !password || !password2) {
      if (msg) msg.textContent = "❌ Tous les champs obligatoires doivent être remplis";
      return;
    }

    if (password !== password2) {
      if (msg) msg.textContent = "❌ Les mots de passe ne correspondent pas";
      return;
    }

    if (!phone || !address) {
      if (msg) msg.textContent = "❌ Téléphone et adresse sont obligatoires";
      return;
    }

    // Vérification des 3 cases légales
    if (
      !document.getElementById("acceptCgu")?.checked ||
      !document.getElementById("acceptLegal")?.checked ||
      !document.getElementById("acceptConditions")?.checked
    ) {
      if (msg) msg.textContent = "❌ Toutes les conditions doivent être acceptées";
      return;
    }

    try {
      // Création du compte Auth
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // Création du document user (conforme aux rules)
      const userData = {
        firstName,
        lastName,
        email,
        phone,
        address,
        createdAt: serverTimestamp()
      };

      // Complément d’adresse OPTIONNEL
      if (address2) {
        userData.address2 = address2;
      }

      await setDoc(doc(db, "users", cred.user.uid), userData);

      if (msg) msg.textContent = "✅ Compte créé";
      location.replace("../index.html");

    } catch (err) {
      console.error(err);
      if (msg) msg.textContent = "❌ Erreur lors de l’inscription";
    }
  });
}
