import { auth, db, storage } from "/wauklink-site/shared/firebase.js";
import {
  onAuthStateChanged,
  updatePassword,
  updateEmail
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

console.log("✅ PROFIL.JS FINAL — STABLE");

// =========================
// DOM
// =========================
const avatarImg = document.getElementById("avatarImg");
const avatarInput = document.getElementById("avatarInput");
const avatarLoader = document.getElementById("avatarLoader");
const avatarMsg = document.getElementById("avatarMsg");

const emailEl = document.getElementById("email");
const typeEl = document.getElementById("type");

const firstNameInput = document.getElementById("firstNameInput");
const phoneInput = document.getElementById("phoneInput");
const saveBtn = document.getElementById("saveProfileBtn");
const profileMsg = document.getElementById("profileMsg");

const newPassword = document.getElementById("newPassword");
const passwordMsg = document.getElementById("passwordMsg");
const changePasswordBtn = document.getElementById("changePasswordBtn");

const newEmail = document.getElementById("newEmail");
const changeEmailBtn = document.getElementById("changeEmailBtn");
const emailMsg = document.getElementById("emailMsg");

// =========================
// RESIZE IMAGE
// =========================
function resizeImage(file, maxSize = 256) {
  return new Promise(resolve => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(b => resolve(b), "image/jpeg", 0.9);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// =========================
// AUTH
// =========================
onAuthStateChanged(auth, async user => {
  if (!user) {
    location.href = "/wauklink-site/auth/login.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);
  let snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      role: "user",
      isPro: false,
      firstName: "",
      phone: "",
      avatarUrl: null,
      createdAt: serverTimestamp()
    });
    snap = await getDoc(userRef);
  }

  const data = snap.data();

  // =========================
  // INFOS
  // =========================
  emailEl.innerHTML = `<strong>Email :</strong> ${user.email}`;
  newEmail.value = user.email;

  typeEl.innerHTML = `<strong>Type de compte :</strong> ${data.role === "admin" ? "👑 Administrateur" : data.isPro ? "🟢 PRO" : "⚪ Standard"}`;

  firstNameInput.value = data.firstName || "";
  phoneInput.value = data.phone || "";

  // =========================
  // AVATAR AU CHARGEMENT
  // =========================
  if (data.avatarUrl) {
  avatarLoader.classList.remove("hidden");

  avatarImg.onload = () => {
    avatarLoader.classList.add("hidden");
    avatarImg.classList.remove("hidden");
  };

  avatarImg.onerror = () => {
    avatarLoader.classList.add("hidden");
    avatarImg.classList.remove("hidden");
    avatarImg.src = "/wauklink-site/assets/avatar-default.png";
  };

  avatarImg.src = data.avatarUrl;
}

  // =========================
  // SAVE PROFIL
  // =========================
  saveBtn.onclick = async () => {
    await updateDoc(userRef, {
      firstName: firstNameInput.value.trim(),
      phone: phoneInput.value.trim()
    });
    profileMsg.textContent = "✅ Profil mis à jour";
  };

  // =========================
  // AVATAR UPLOAD — VERSION STABLE
  // =========================
  avatarInput.onchange = async e => {
    const file = e.target.files[0];
    if (!file) return;

    avatarImg.classList.add("hidden");
    avatarLoader.classList.remove("hidden");
    avatarMsg.textContent = "⏳ Upload...";

    try {
      const resized = await resizeImage(file);
      const avatarRef = ref(storage, `avatars/${user.uid}.jpg`);

      await uploadBytes(avatarRef, resized, { contentType: "image/jpeg" });
      const url = await getDownloadURL(avatarRef);

      await updateDoc(userRef, { avatarUrl: url });

      avatarImg.onload = () => {
        avatarLoader.classList.add("hidden");
        avatarImg.classList.remove("hidden");
      };
      avatarImg.src = url;

      avatarMsg.textContent = "✅ Avatar mis à jour";
    } catch (e) {
      console.error(e);
      avatarMsg.textContent = "❌ Erreur upload";
      avatarLoader.classList.add("hidden");
    }

    avatarInput.value = "";
  };

  // =========================
  // PASSWORD
  // =========================
  changePasswordBtn.onclick = async () => {
    if (newPassword.value.length < 6) {
      passwordMsg.textContent = "❌ 6 caractères minimum";
      return;
    }
    await updatePassword(user, newPassword.value);
    passwordMsg.textContent = "✅ Mot de passe modifié";
    newPassword.value = "";
  };

  // =========================
  // EMAIL
  // =========================
  changeEmailBtn.onclick = async () => {
    await updateEmail(user, newEmail.value.trim());
    emailMsg.textContent = "✅ Email modifié";
  };
});
