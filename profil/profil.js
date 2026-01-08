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
// ELEMENTS DOM
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
// RESIZE IMAGE (AVANT UPLOAD)
// =========================
function resizeImage(file, maxSize = 256) {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(maxSize / img.width, maxSize / img.height);

        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => resolve(blob),
          "image/jpeg",
          0.85
        );
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// =========================
// AUTH
// =========================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = "/wauklink-site/auth/login.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);

  // =========================
  // INFOS AUTH
  // =========================
  emailEl.innerHTML = `<strong>Email :</strong> ${user.email}`;
  newEmail.value = user.email;

  // =========================
  // FIRESTORE USER
  // =========================
  let snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      role: "user",
      isPro: false,
      firstName: "",
      phone: "",
      createdAt: serverTimestamp()
    });
    snap = await getDoc(userRef);
  }

  const data = snap.data();
  firstNameInput.value = data.firstName || "";
  phoneInput.value = data.phone || "";

  // =========================
  // AVATAR AU CHARGEMENT (SANS CACHE‑BUST)
  // =========================
  if (data.avatarUrl) {
    avatarImg.src = data.avatarUrl;
    avatarImg.classList.remove("hidden");
  }

  // =========================
  // TYPE DE COMPTE
  // =========================
  proAction.innerHTML = "";
  if (data.role === "admin") {
    typeEl.innerHTML = `<strong>Type de compte :</strong> 👑 Administrateur`;
  } else if (data.isPro === true) {
    typeEl.innerHTML = `<strong>Type de compte :</strong> 🟢 Compte PRO`;
  } else {
    typeEl.innerHTML = `<strong>Type de compte :</strong> ⚪ Compte standard`;
    const q = query(
      collection(db, "pro_requests"),
      where("userId", "==", user.uid),
      where("status", "==", "pending")
    );
    const reqSnap = await getDocs(q);
    if (!reqSnap.empty) {
      proAction.textContent = "⏳ Demande PRO en attente";
    } else {
      const btn = document.createElement("button");
      btn.className = "btn btn-ok";
      btn.textContent = "🚀 Passer PRO";
      btn.onclick = async () => {
        await addDoc(collection(db, "pro_requests"), {
          userId: user.uid,
          status: "pending",
          createdAt: serverTimestamp()
        });
        proAction.textContent = "⏳ Demande PRO envoyée";
      };
      proAction.appendChild(btn);
    }
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
      profileMsg.textContent = "❌ Erreur lors de la sauvegarde";
    }
  };

  // =========================
  // AVATAR — UPLOAD FINAL (PRO)
  // =========================
  let uploadingAvatar = false;

  avatarInput.addEventListener("change", async (e) => {
    if (uploadingAvatar) return;

    const originalFile = e.target.files?.[0];
    if (!originalFile) return;

    uploadingAvatar = true;
    avatarInput.disabled = true;
    avatarMsg.textContent = "⏳ Upload en cours...";

    avatarImg.classList.add("hidden");
    avatarLoader.classList.remove("hidden");

    const oldAvatarUrl = data.avatarUrl || null;

    try {
      const resizedFile = await resizeImage(originalFile);

      const avatarRef = ref(
        storage,
        `avatars/${user.uid}_${Date.now()}.jpg`
      );

      const uploadTask = uploadBytesResumable(avatarRef, resizedFile, {
        contentType: "image/jpeg"
      });

      await new Promise((resolve, reject) => {
        uploadTask.on("state_changed", null, reject, resolve);
      });

      const url = await getDownloadURL(avatarRef);

      await updateDoc(userRef, { avatarUrl: url });
      data.avatarUrl = url;

      // 🗑️ suppression ancien avatar
      if (oldAvatarUrl) {
        try {
          await deleteObject(ref(storage, oldAvatarUrl));
        } catch {}
      }

      avatarImg.src = url + "?t=" + Date.now();
      avatarMsg.textContent = "✅ Avatar mis à jour";
    } catch (err) {
      console.error(err);
      avatarMsg.textContent = "❌ Erreur upload";
    } finally {
      uploadingAvatar = false;
      avatarInput.disabled = false;
      avatarInput.value = "";
      avatarLoader.classList.add("hidden");
      avatarImg.classList.remove("hidden");
    }
  });

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
