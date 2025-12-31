import { auth, db } from "../shared/firebase.js";
import { createUserWithEmailAndPassword } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const form = document.getElementById("form");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const firstName = firstNameInput.value.trim();
  const lastName  = lastNameInput.value.trim();
  const phone     = phoneInput.value.trim();
  const address   = addressInput.value.trim();
  const email     = emailInput.value.trim();
  const password  = passwordInput.value;

  const cgu1 = document.getElementById("cgu1").checked;
  const cgu2 = document.getElementById("cgu2").checked;
  const cgu3 = document.getElementById("cgu3").checked;

  if (!cgu1 || !cgu2 || !cgu3) {
    msg.textContent = "❌ Tu dois accepter toutes les conditions";
    return;
  }

  msg.textContent = "⏳ Création du compte…";

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

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

    msg.textContent = "✅ Compte créé";
    setTimeout(() => location.href = "../index.html", 800);

  } catch (err) {
    console.error(err);
    msg.textContent = "❌ " + err.code;
  }
});
