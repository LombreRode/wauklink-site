import { auth, db } from "../shared/firebase.js";

import { createUserWithEmailAndPassword } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import { doc, setDoc, serverTimestamp } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form");
  const msg  = document.getElementById("msg");

  if (!form) {
    console.error("❌ Formulaire #form introuvable");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstName = document.getElementById("firstName").value.trim();
    const lastName  = document.getElementById("lastName").value.trim();
    const phone     = document.getElementById("phone").value.trim();
    const address   = document.getElementById("address").value.trim();
    const email     = document.getElementById("email").value.trim();
    const password  = document.getElementById("password").value;
    const passwordConfirm =
      document.getElementById("passwordConfirm")?.value;

    const cgu1 = document.getElementById("cgu1").checked;
    const cgu2 = document.getElementById("cgu2").checked;
    const cgu3 = document.getElementById("cgu3").checked;

    if (!cgu1 || !cgu2 || !cgu3) {
      msg.textContent = "❌ Tu dois accepter toutes les conditions";
      return;
    }

    if (passwordConfirm !== undefined && password !== passwordConfirm) {
      msg.textContent = "❌ Les mots de passe ne correspondent pas";
      return;
    }

    msg.textContent = "⏳ Création du compte…";

    try {
      const cred =
        await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", cred.user.uid), {
        firstName,
        lastName,
        phone,
        address,
        email,
        role: "user",
        abonnement: { type: "free" },
        cgu: {
          accepted: true,
          acceptedAt: serverTimestamp()
        },
        createdAt: serverTimestamp()
      });

      msg.textContent = "✅ Compte créé avec succès";
      setTimeout(() => {
        location.href = "/wauklink-site/index.html";
      }, 800);

    } catch (err) {
      console.error(err);
      msg.textContent = "❌ " + err.code;
    }
  });
});
