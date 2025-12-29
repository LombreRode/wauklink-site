import { auth, db } from "../_shared/firebase.js";
import { createUserWithEmailAndPassword } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// 🔗 LIENS INPUTS (OBLIGATOIRE)
const form = document.getElementById("registerForm");
const msg = document.getElementById("msg");

const lastName = document.getElementById("lastName");
const firstName = document.getElementById("firstName");
const email = document.getElementById("email");
const password = document.getElementById("password");
const password2 = document.getElementById("password2");
const phone = document.getElementById("phone");
const address = document.getElementById("address");
const address2 = document.getElementById("address2");
const postalCode = document.getElementById("postalCode");
const city = document.getElementById("city");

const acceptCgu = document.getElementById("acceptCgu");
const acceptLegal = document.getElementById("acceptLegal");
const acceptConditions = document.getElementById("acceptConditions");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";

  // 🔐 Vérifs
  if (password.value !== password2.value) {
    msg.textContent = "❌ Les mots de passe ne correspondent pas";
    return;
  }

  if (!acceptCgu.checked || !acceptLegal.checked || !acceptConditions.checked) {
    msg.textContent = "❌ Tu dois accepter toutes les conditions";
    return;
  }

  try {
    // ✅ CRÉATION COMPTE AUTH
    const cred = await createUserWithEmailAndPassword(
      auth,
      email.value.trim(),
      password.value
    );

    // ✅ CRÉATION PROFIL FIRESTORE
    await setDoc(doc(db, "users", cred.user.uid), {
      lastName: lastName.value.trim(),
      firstName: firstName.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
      address: address.value.trim(),
      address2: address2.value.trim(),
      postalCode: postalCode.value.trim(),
      city: city.value.trim(),
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

    // 🔁 REDIRECTION
    location.replace("../index.html");

  } catch (err) {
    console.error(err);
    msg.textContent = err.message || "❌ Erreur inscription";
  }
});
