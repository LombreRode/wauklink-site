import { auth, db } from "/wauklink-site/shared/firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc, getDoc, updateDoc,
  collection, query, where, getDocs, addDoc, serverTimestamp
} from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  getStorage, ref, uploadBytes, getDownloadURL
} from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

const storage = getStorage();

// HTML
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

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = "/wauklink-site/auth/login.html";
    return;
  }

  emailEl.innerHTML = `<strong>Email :</strong> ${user.email}`;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  const data = snap.data();

  firstNameInput.value = data.firstName || "";
  phoneInput.value = data.phone || "";

  // AVATAR
  if (data.avatarUrl) {
    avatarImg.src = data.avatarUrl + "?t=" + Date.now();
  }

  // TYPE DE COMPTE
  if (data.role === "admin") {
    typeEl.innerHTML = "👑 Administrateur";
    return;
  }

  if (data.isPro === true) {
    typeEl.innerHTML = "🟢 Compte PRO";
    return;
  }

  typeEl.innerHTML = "⚪ Compte standard";

  // BOUTON PASSER PRO
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

  // SAUVEGARDE PROFIL
  saveBtn.onclick = async () => {
    await updateDoc(userRef, {
      firstName: firstNameInput.value.trim(),
      phone: phoneInput.value.trim()
    });
    profileMsg.textContent = "✅ Profil enregistré";
  };

  // UPLOAD AVATAR
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
});
