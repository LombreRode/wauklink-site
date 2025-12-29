import { auth, db } from "../_shared/firebase.js";
import {
  createUserWithEmailAndPassword
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
  msg.textContent = "";

  const password = document.getElementById("password").value;
  const password2 = document.getElementById("password2").value;

  if (password !== password2) {
    msg.textContent = "❌ Les mots de passe ne correspondent pas.";
    return;
  }

  const acceptCgu = document.getElementById("acceptCgu");
  const acceptLegal = document.getElementById("acceptLegal");
  const acceptConditions = document.getElementById("acceptConditions");

  if (!acceptCgu.checked || !acceptLegal.checked || !acceptConditions.checked) {
    msg.textContent = "❌ Vous devez accepter les CGU, mentions légales et conditions d’utilisation.";
    return;
  }

  const data = {
    lastName: document.getElementById("lastName").value.trim(),
    firstName: document.getElementById("firstName").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    address: document.getElementById("address").value.trim(),
    address2: document.getElementById("address2").value.trim(),
    postalCode: document.getElementById("postalCode").value.trim(),
    city: document.getElementById("city").value.trim()
  };

  try {
    const cred = await createUserWithEmailAndPassword(
      auth,
      data.email,
      password
    );

    await setDoc(doc(db, "users", cred.user.uid), {
      ...data,
      role: "user",
      profile: { completed: true },
      legal: {
        cgu: true,
        legalNotice: true,
        conditions: true,
        acceptedAt: serverTimestamp()
      },
      createdAt: serverTimestamp()
    });

    location.href = "../dashboard/pro.html";

  } catch (err) {
    console.error(err);
    msg.textContent = err.message || "Erreur lors de l’inscription";
  }
});
