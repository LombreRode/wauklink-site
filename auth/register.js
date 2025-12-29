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

  const email = email.value.trim();
  const password = password.value;
  const displayName = displayName.value.trim();

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });

    await setDoc(doc(db, "users", cred.user.uid), {
      email,
      displayName,
      role: "user",
      createdAt: serverTimestamp()
    });

    location.href = "./profile.html";
  } catch (e) {
    msg.textContent = e.message;
  }
});
