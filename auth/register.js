import { auth, db } from "/wauklink-site/shared/firebase.js";
import { createUserWithEmailAndPassword } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const form = document.getElementById("registerForm");
const msg = document.getElementById("msg");

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

    // 1️⃣ Création Auth
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // 2️⃣ Attendre que l'utilisateur soit bien reconnu
    await new Promise(resolve => setTimeout(resolve, 300));

    // 3️⃣ Création Firestore
    await setDoc(doc(db, "users", cred.user.uid), {
      firstName: document.getElementById("firstName").value.trim(),
      lastName: document.getElementById("lastName").value.trim(),
      email: cred.user.email,
      role: "user",
      abonnement: { type: "free" },
      createdAt: serverTimestamp()
    });

    msg.textContent = "✅ Compte créé";
    location.replace("/wauklink-site/index.html");

  } catch (err) {
    console.error(err);
    msg.textContent = err.code || err.message || "Erreur création compte";
  }
});
