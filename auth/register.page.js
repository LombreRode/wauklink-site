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

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const password2 = document.getElementById("password2").value;

    if (password !== password2) {
      if (msg) msg.textContent = "❌ Les mots de passe ne correspondent pas";
      return;
    }

    // 🔒 Vérification STRICTE des 3 cases (conforme aux rules)
    if (
      !document.getElementById("acceptCgu")?.checked ||
      !document.getElementById("acceptLegal")?.checked ||
      !document.getElementById("acceptConditions")?.checked
    ) {
      if (msg) msg.textContent = "❌ Toutes les conditions doivent être acceptées";
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // Création du document user STRICTEMENT avec l’UID (conforme aux rules)
      await setDoc(doc(db, "users", cred.user.uid), {
        firstName: document.getElementById("firstName").value.trim(),
        lastName: document.getElementById("lastName").value.trim(),
        email: cred.user.email,
        createdAt: serverTimestamp()
      });

      if (msg) msg.textContent = "✅ Compte créé";
      location.replace("../index.html");

    } catch (err) {
      console.error(err);
      if (msg) msg.textContent = "❌ Erreur lors de l’inscription";
    }
  });
}
