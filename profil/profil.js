/* =================================================
    WAUKLINK — PROFIL.JS
    VERSION FINALE STABLE — CORRECTIF CORS & VARIABLES
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

// 1. Sélection des éléments stables
const avatarInput = document.getElementById("avatarInput");
const avatarImg   = document.getElementById("avatarImg");

let currentUser = null;

onAuthStateChanged(auth, user => {
  if (!user) return;
  currentUser = user;
});

// 2. Gestionnaire d'événement pour l'avatar
avatarInput.addEventListener("change", async () => {
  // Définition correcte de l'élément de message
  const msg = document.getElementById("avatarMsg"); 
  
  // Récupération du fichier AVANT toute vérification
  const file = avatarInput.files[0];

  // Vérification de sécurité (Règle le bug "file is not defined")
  if (!file || !currentUser) return;

  // 3. Validations locales
  if (!file.type.startsWith("image/")) {
    msg.textContent = "❌ Fichier invalide";
    return;
  }

  if (file.size > 6 * 1024 * 1024) {
    msg.textContent = "❌ Image trop lourde (max 6 Mo)";
    return;
  }

  msg.textContent = "⏳ Upload de l’avatar...";
  
  try {
    // Configuration du stockage Firebase
    const path = `avatars/${currentUser.uid}/${Date.now()}_${file.name}`;
    const fileRef = ref(storage, path);

    // Lancement de l'upload
    const task = uploadBytesResumable(fileRef, file);

    // Attente de la fin de la tâche
    await new Promise((resolve, reject) => {
      task.on("state_changed", null, reject, resolve);
    });

    // Récupération de l'URL finale
    const url = await getDownloadURL(fileRef);

    // Mise à jour de la base de données Firestore
    await updateDoc(doc(db, "users", currentUser.uid), {
      avatarUrl: url,
      avatarPath: path,
      updatedAt: serverTimestamp()
    });

    // Mise à jour visuelle avec cache-busting
    avatarImg.src = url + "?t=" + Date.now();
    msg.textContent = "✅ Avatar mis à jour";

  } catch (e) {
    console.error("Erreur d'upload :", e);
    // Gestion spécifique du blocage CORS
    msg.textContent = "❌ Erreur de connexion au serveur (CORS)";
  }
});
