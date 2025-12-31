import { auth, db } from "../shared/firebase.js";
import { createUserWithEmailAndPassword } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

console.log("REGISTER.JS CHARGÉ");

const form = document.getElementById("registerForm");
const msg = document.getElementById("msg");

if (!form || !msg) {
  console.error("❌ registerForm ou msg introuvable");
} else {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "Création du compte…";

    try {
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const password2 = document.getElementById("password2").value;

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

      const cred = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", cred.user.uid), {
        firstName: document.getElementById("firstName").value.trim(),
        lastName: document.getElementById("lastName").value.trim(),
        email: cred.user.email,
        role: "user",
        abonnement: { type: "free" },
        createdAt: serverTimestamp()
      });

      msg.textContent = "✅ Compte créé";
      location.replace("../index.html");

    } catch (err) {
      console.error(err);
      msg.textContent = err.code || err.message;
    }
  });
}
