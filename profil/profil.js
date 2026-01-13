/* =================================================
   WAUKLINK — PROFIL.JS
   VERSION FINALE STABLE — SANS BUG
================================================= */
import { auth, db, storage } from "../shared/firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  doc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import {
  ref,
  uploadBytesResumable,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

const avatarInput = document.getElementById("avatarInput");
const avatarImg   = document.getElementById("avatarImg");
const msg         = document.getElementById("msg");

let currentUser = null;

onAuthStateChanged(auth, user => {
  if (!user) return;
  currentUser = user;
});

avatarInput.addEventListener("change", async () => {
  const msg = document.getElementById("avatarMsg");
  if (!file || !currentUser) return;

  if (!file.type.startsWith("image/")) {
    msg.textContent = "❌ Fichier invalide";
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    msg.textContent = "❌ Image trop lourde (max 2 Mo)";
    return;
  }

  msg.textContent = "⏳ Upload de l’avatar…";

  try {
    const path = `avatars/${currentUser.uid}/${Date.now()}_${file.name}`;
    const fileRef = ref(storage, path);

    const task = uploadBytesResumable(fileRef, file);

    await new Promise((resolve, reject) => {
      task.on("state_changed", null, reject, resolve);
    });

    const url = await getDownloadURL(fileRef);

    await updateDoc(doc(db, "users", currentUser.uid), {
      avatarUrl: url,
      avatarPath: path,
      updatedAt: serverTimestamp()
    });

    avatarImg.src = url + "?t=" + Date.now();
    msg.textContent = "✅ Avatar mis à jour";

  } catch (e) {
    console.error(e);
    msg.textContent = "❌ Erreur upload avatar";
  }
});
