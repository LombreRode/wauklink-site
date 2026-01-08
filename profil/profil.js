console.log("🔥 PROFIL.JS FINAL — OK");

import { auth, db, storage } from "/wauklink-site/shared/firebase.js";
import { onAuthStateChanged, updatePassword, updateEmail }
  from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL, deleteObject }
  from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

const avatarImg = document.getElementById("avatarImg");
const avatarInput = document.getElementById("avatarInput");
const avatarMsg = document.getElementById("avatarMsg");
const avatarLoader = document.getElementById("avatarLoader");

const emailEl = document.getElementById("email");
const typeEl = document.getElementById("type");
const firstNameInput = document.getElementById("firstNameInput");
const phoneInput = document.getElementById("phoneInput");
const saveBtn = document.getElementById("saveProfileBtn");

const newPassword = document.getElementById("newPassword");
const passwordMsg = document.getElementById("passwordMsg");
const changePasswordBtn = document.getElementById("changePasswordBtn");

const newEmail = document.getElementById("newEmail");
const emailMsg = document.getElementById("emailMsg");
const changeEmailBtn = document.getElementById("changeEmailBtn");

onAuthStateChanged(auth, async user => {
  if (!user) return location.href = "/wauklink-site/auth/login.html";

  const userRef = doc(db, "users", user.uid);
  let snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      firstName: "",
      phone: "",
      avatarUrl: null,
      avatarPath: null,
      createdAt: serverTimestamp()
    });
    snap = await getDoc(userRef);
  }

  const data = snap.data();

  emailEl.innerHTML = `<strong>Email :</strong> ${user.email}`;
  typeEl.innerHTML = `<strong>Type de compte :</strong> ⚪ Standard`;
  newEmail.value = user.email;
  firstNameInput.value = data.firstName || "";
  phoneInput.value = data.phone || "";

  if (data.avatarUrl) {
    avatarLoader.classList.remove("hidden");
    avatarImg.onload = () => {
      avatarLoader.classList.add("hidden");
      avatarImg.classList.remove("hidden");
    };
    avatarImg.src = data.avatarUrl;
  }

  saveBtn.onclick = async () => {
    await updateDoc(userRef, {
      firstName: firstNameInput.value.trim(),
      phone: phoneInput.value.trim()
    });
  };

  avatarInput.onchange = async e => {
    const file = e.target.files[0];
    if (!file) return;

    avatarLoader.classList.remove("hidden");
    avatarImg.classList.add("hidden");

    const path = `avatars/${user.uid}.jpg`;
    const avatarRef = ref(storage, path);

    if (data.avatarPath) {
      await deleteObject(ref(storage, data.avatarPath)).catch(() => {});
    }

    await uploadBytes(avatarRef, file);
    const url = await getDownloadURL(avatarRef);

    await updateDoc(userRef, {
      avatarUrl: url,
      avatarPath: path
    });

    avatarImg.onload = () => {
      avatarLoader.classList.add("hidden");
      avatarImg.classList.remove("hidden");
    };
    avatarImg.src = url + "?t=" + Date.now();
  };

  changePasswordBtn.onclick = async () => {
    if (newPassword.value.length < 6) return;
    await updatePassword(user, newPassword.value);
    passwordMsg.textContent = "✅ Mot de passe modifié";
    newPassword.value = "";
  };

  changeEmailBtn.onclick = async () => {
    await updateEmail(user, newEmail.value.trim());
    emailMsg.textContent = "✅ Email modifié";
  };
});
