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
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

console.log("✅ PROFIL.JS CHARGÉ");

// =========================
// DOM
// =========================
const avatarImg = document.getElementById("avatarImg");
const avatarInput = document.getElementById("avatarInput");
const avatarMsg = document.getElementById("avatarMsg");
const avatarLoader = document.getElementById("avatarLoader");

const emailEl = document.getElementById("email");
const typeEl = document.getElementById("type");
const proAction = document.getElementById("proAction");

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
        canvas.toBlob(blob => resolve(blob), "image/jpeg", 0.85);
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
      avatarPath: null,
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
    avatarImg.src = data.avatarUrl;
  }

  // =========================
  // TYPE DE COMPTE
  // =========================
  if (data.role === "admin") {
    typeEl.innerHTML = `<strong>Type de compte :</strong> 👑 Administrateur`;
  } else if (data.isPro) {
    typeEl.innerHTML = `<strong>Type de compte :</strong> 🟢 Compte PRO`;
  } else {
    typeEl.innerHTML = `<strong>Type de compte :</strong> ⚪ Compte standard`;
  }

  // =========================
  // SAVE PROFIL
  // =========================
  saveBtn.onclick = async () => {
    try {
      await updateDoc(userRef, {
        firstName: firstNameInput.value.trim(),
        phone: phoneInput.value.trim()
      });
      profileMsg.textContent = "✅ Profil mis à jour";
    } catch {
      profileMsg.textContent = "❌ Erreur sauvegarde";
    }
  };

  // =========================
  // AVATAR UPLOAD (PROPRE)
  // =========================
  let uploading = false;

  avatarInput.onchange = async e => {
    if (uploading) return;
    const file = e.target.files[0];
    if (!file) return;

    uploading = true;
    avatarInput.disabled = true;
    avatarImg.classList.add("hidden");
    avatarLoader.classList.remove("hidden");
    avatarMsg.textContent = "⏳ Upload...";

    try {
      const resized = await resizeImage(file);
      const path = `avatars/${user.uid}_${Date.now()}.jpg`;
      const avatarRef = ref(storage, path);

      await uploadBytesResumable(avatarRef, resized);
      const url = await getDownloadURL(avatarRef);

      // suppression ancien avatar (PAR PATH)
      if (data.avatarPath) {
        await deleteObject(ref(storage, data.avatarPath)).catch(() => {});
      }

      await updateDoc(userRef, {
        avatarUrl: url,
        avatarPath: path
      });

      data.avatarUrl = url;
      data.avatarPath = path;

      avatarImg.onload = () => {
        avatarLoader.classList.add("hidden");
        avatarImg.classList.remove("hidden");
      };
      avatarImg.src = url + "?t=" + Date.now();
      avatarMsg.textContent = "✅ Avatar mis à jour";

    } catch (e) {
      console.error(e);
      avatarMsg.textContent = "❌ Erreur upload";
      avatarLoader.classList.add("hidden");
      avatarImg.classList.remove("hidden");
    }

    uploading = false;
    avatarInput.disabled = false;
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
