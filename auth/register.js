import { auth, db } from "../_shared/firebase.js";
import { createUserWithEmailAndPassword } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const form = document.getElementById("registerForm");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";

  if (password.value !== password2.value) {
    msg.textContent = "❌ Les mots de passe ne correspondent pas";
    return;
  }

  if (!acceptCgu.checked || !acceptLegal.checked || !acceptConditions.checked) {
    msg.textContent = "❌ Accepte toutes les conditions";
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(
      auth,
      email.value.trim(),
      password.value
    );

    await setDoc(doc(db, "users", cred.user.uid), {
      lastName: lastName.value,
      firstName: firstName.value,
      email: email.value,
      phone: phone.value,
      address: address.value,
      address2: address2.value,
      postalCode: postalCode.value,
      city: city.value,
      role: "user",
      profile: { completed: true },
      legal: { acceptedAt: serverTimestamp() },
      createdAt: serverTimestamp()
    });

    location.replace("../index.html");

  } catch (e) {
    console.error(e);
    msg.textContent = e.message;
  }
});
