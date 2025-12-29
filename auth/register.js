import { auth, db } from "../_shared/firebase.js";
import {
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const form = document.getElementById("registerForm");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "Création du compte…";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const displayName = document.getElementById("displayName").value.trim();

  try {
    // 1️⃣ Création compte Auth
    const cred = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // 2️⃣ Nom affiché
    await updateProfile(cred.user, { displayName });

    // 3️⃣ Création document Firestore (OBLIGATOIRE)
    await setDoc(doc(db, "users", cred.user.uid), {
      email,
      displayName,
      role: "user",
      abonnement: {
        type: "free"
      },
      pro: {
        validated: false
      },
      createdAt: serverTimestamp()
    });

    // 4️⃣ Redirection
    msg.textContent = "Compte créé avec succès.";
    location.href = "../dashboard/pro.html";

  } catch (err) {
    console.error(err);
    msg.textContent = err.message || "Erreur lors de l’inscription.";
  }
});
