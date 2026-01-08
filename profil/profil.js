import { auth, db, storage } from "/wauklink-site/shared/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc, getDoc, setDoc, updateDoc,
  collection, addDoc, query, where, getDocs, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

console.log("✅ profil.js chargé");

// HTML
const avatarImg = document.getElementById("avatarImg");
const avatarInput = document.getElementById("avatarInput");
const avatarMsg = document.getElementById("avatarMsg");
const emailEl = document.getElementById("email");
const typeEl = document.getElementById("type");
const proAction = document.getElementById("proAction");
const firstNameInput = document.getElementById("firstNameInput");
const phoneInput = document.getElementById("phoneInput");
const saveBtn = document.getElementById("saveBtn");
const profileMsg = document.getElementById("profileMsg");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = "/wauklink-site/auth/login.html";
    return;
  }

  emailEl.textContent = "Email : " + user.email;

  const userRef = doc(db, "users", user.uid);
  let snap = await getDoc(userRef);

  // 🔥 CRÉATION AUTO DU PROFIL
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

  // 🟢 TYPE DE COMPTE + PRO
  proAction.innerHTML = "";

  if (data.role === "admin") {
    typeEl.textContent = "👑 Administrateur";
  } else if (data.isPro === true) {
    typeEl.textContent = "🟢 Compte PRO";
  } else {
    typeEl.textContent = "⚪ Compte standard";

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

  // 💾 ENREGISTREMENT PROFIL
  saveBtn.onclick = async () => {
    await updateDoc(userRef, {
      firstName: firstNameInput.value || "",
      phone: phoneInput.value || ""
    });
    profileMsg.textContent = "✅ Profil enregistré";
  };

  // 🖼️ AVATAR
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

