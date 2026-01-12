import { auth, db } from "/wauklink-site/shared/firebase.js";
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const form = document.getElementById("form");
const msg  = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";

  const firstName = document.getElementById("firstName").value.trim();
  const lastName  = document.getElementById("lastName").value.trim();
  const phone     = document.getElementById("phone").value.trim();
  const address   = document.getElementById("address").value.trim();
  const email     = document.getElementById("email").value.trim();
  const password  = document.getElementById("password").value;
  const passwordConfirm =
    document.getElementById("passwordConfirm").value;

  const acceptPrivacy = document.getElementById("acceptPrivacy").checked;
  const acceptCgu     = document.getElementById("acceptCgu").checked;
  const acceptLegal   = document.getElementById("acceptLegal").checked;
  const isAdult       = document.getElementById("isAdult").checked;

  // 🔒 Vérifications légales
  if (!acceptPrivacy || !acceptCgu || !acceptLegal || !isAdult) {
    msg.textContent = "Vous devez accepter toutes les conditions.";
    return;
  }

  if (password !== passwordConfirm) {
    msg.textContent = "Les mots de passe ne correspondent pas.";
    return;
  }

  try {
    msg.textContent = "⏳ Création du compte…";

    // 🔐 Création compte Auth
    const cred = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const uid = cred.user.uid;

    // 🧾 Création profil Firestore
    await setDoc(doc(db, "users", uid), {
      firstName,
      lastName,
      phone,
      address,
      email,
      role: "user",
      abonnement: {
        type: "free"
      },
      createdAt: serverTimestamp()
    });

    // ✅ Succès
    msg.textContent = "Compte créé avec succès 🎉";

    setTimeout(() => {
      location.href = "/wauklink-site/dashboard/index.html";
    }, 800);

  } catch (err) {
    console.error("register error:", err);
    msg.textContent =
      err.message || "Erreur lors de la création du compte.";
  }
});
