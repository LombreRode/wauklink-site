import { auth, db, storage } from "/wauklink-site/shared/firebase.js";
import {
  onAuthStateChanged,
  updatePassword,
  updateEmail
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc, getDoc, setDoc, updateDoc,
  collection, addDoc, query, where, getDocs, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

console.log("✅ PROFIL.JS CHARGÉ");

// ELEMENTS
const avatarImg = document.getElementById("avatarImg");
const avatarInput = document.getElementById("avatarInput");
const avatarMsg = document.getElementById("avatarMsg");
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

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = "/wauklink-site/auth/login.html";
    return;
  }

  emailEl.innerHTML = `<strong>Email :</strong> ${user.email}`;
  newEmail.value = user.email;

  const userRef = doc(db, "users", user.uid);
  let snap = await getDoc(userRef);

  // Création auto du user si absent
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

  if (data.avatarUrl) {
    avatarImg.src = data.avatarUrl + "?t=" + Date.now();
  }

  // TYPE DE COMPTE
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

  // SAVE PROFIL
  saveBtn.onclick = async () => {
    await updateDoc(userRef, {
      firstName: firstNameInput.value.trim(),
      phone: phoneInput.value.trim()
    });
    profileMsg.textContent = "✅ Profil mis à jour";
  };

  // AVATAR
  avatarInput.onchange = async () => {
    const file = avatarInput.files[0];
    if (!file) return;

    const avatarRef = ref(storage, `avatars/${user.uid}.jpg`);
    await uploadBytes(avatarRef, file);
    const url = await getDownloadURL(avatarRef);

    await updateDoc(userRef, { avatarUrl: url });
    avatarImg.src = url + "?t=" + Date.now();
    avatarMsg.textContent = "✅ Avatar mis à jour";
  };

  // PASSWORD
  changePasswordBtn.onclick = async () => {
    if (newPassword.value.length < 6) {
      passwordMsg.textContent = "❌ 6 caractères minimum";
      return;
    }
    await updatePassword(user, newPassword.value);
    passwordMsg.textContent = "✅ Mot de passe modifié";
    newPassword.value = "";
  };

  // EMAIL
  changeEmailBtn.onclick = async () => {
    await updateEmail(user, newEmail.value.trim());
    emailMsg.textContent = "✅ Email modifié";
  };
});
