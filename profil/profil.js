/* =================================================
    WAUKLINK — PROFIL.JS
    VERSION CORRIGÉE ET STABLE
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

// Sélection des éléments HTML
const avatarInput = document.getElementById("avatarInput");
const avatarImg   = document.getElementById("avatarImg");

let currentUser = null;

// Gestion de l'état de connexion
onAuthStateChanged(auth, user => {
  if (!user) return;
  currentUser = user;
});

// Événement de changement d'avatar
avatarInput.addEventListener("change", async () => {
  // On récupère l'élément message ici avec le bon ID
  const msg = document.getElementById("avatarMsg"); 
  
  // 1. On récupère le fichier sélectionné
  const file = avatarInput.files[0];

  // 2. Vérification de sécurité : fichier présent et utilisateur connecté
  if (!file || !currentUser) return;

  // 3. Vérification du type et de la taille
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
    // Création du chemin de stockage unique
    const path = `avatars/${currentUser.uid}/${Date.now()}_${file.name}`;
    const fileRef = ref(storage, path);

    // Lancement de l'upload
    const task = uploadBytesResumable(fileRef, file);

    // Attente de la fin de l'upload
    await new Promise((resolve, reject) => {
      task.on("state_changed", null, reject, resolve);
    });

    // Récupération de l'URL publique de l'image
    const url = await getDownloadURL(fileRef);

    // Mise à jour du document utilisateur dans Firestore
    await updateDoc(doc(db, "users", currentUser.uid), {
      avatarUrl: url,
      avatarPath: path,
      updatedAt: serverTimestamp()
    });

    // Mise à jour visuelle immédiate de l'image
    avatarImg.src = url + "?t=" + Date.now();
    msg.textContent = "✅ Avatar mis à jour";

  } catch (e) {
    console.error("Erreur détaillée :", e);
    msg.textContent = "❌ Erreur upload avatar";
  }
});
