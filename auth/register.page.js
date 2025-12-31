import { auth, db } from "../shared/firebase.js";
import { createUserWithEmailAndPassword } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const form = document.getElementById("form");
const msg  = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "⏳ Création du compte…";

  const firstName = document.getElementById("firstName").value.trim();
  const lastName  = document.getElementById("lastName").value.trim();
  const phone     = document.getElementById("phone").value.trim();
  const address   = document.getElementById("address").value.trim();
  const email     = document.getElementById("email").value.trim();
  const password  = document.getElementById("password").value;

  try {
    // 1️⃣ Création Auth
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // 2️⃣ Création Firestore (alignée rules)
    await setDoc(doc(db, "users", cred.user.uid), {
      firstName,
      lastName,
      phone,
      address,
      email,
      role: "user",
      abonnement: { type: "free" },
      createdAt: serverTimestamp()
    });

    msg.textContent = "✅ Compte créé avec succès";
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 800);

  } catch (err) {
    console.error(err);
    msg.textContent = "❌ " + err.code;
  }
});
