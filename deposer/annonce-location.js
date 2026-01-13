/* =================================================
   DÉPOSER UNE ANNONCE — VERSION CORRIGÉE (STABLE)
   ================================================= */
import { auth, db, storage } from "../shared/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  collection,
  addDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import {
  ref,
  uploadBytesResumable,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

/* =========================
   DOM
========================= */
const form         = document.getElementById("annonceForm");
const msg          = document.getElementById("msg");
const photosInput  = document.getElementById("photosInput");
const preview      = document.getElementById("preview");

let currentUser = null;
let files = [];

/* =========================
   PREVIEW DES PHOTOS
========================= */
photosInput.addEventListener("change", () => {
  // On limite à 6 photos maximum
  files = Array.from(photosInput.files).slice(0, 6);
  preview.innerHTML = "";
  
  files.forEach(file => {
    if (!file.type.startsWith("image/")) return;
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.style.maxWidth = "100px";
    img.style.height = "100px";
    img.style.objectFit = "cover";
    img.style.margin = "5px";
    img.style.borderRadius = "8px";
    img.style.border = "1px solid #ddd";
    preview.appendChild(img);
  });
});

/* =========================
   AUTH : VERIFICATION
========================= */
onAuthStateChanged(auth, async user => {
  if (!user) {
    // Rediriger si non connecté
    window.location.href = "/wauklink-site/auth/login.html";
    return;
  }
  currentUser = user;

  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) {
      msg.innerHTML = "<span style='color:red;'>❌ Profil utilisateur introuvable dans Firestore</span>";
      return;
    }
    // Afficher le formulaire si tout est OK
    form.classList.remove("hidden");
  } catch (err) {
    console.error("Erreur Auth:", err);
  }
});

/* =========================
   SUBMIT : PUBLICATION
========================= */
form.addEventListener("submit", async e => {
  e.preventDefault();
  
  if (files.length === 0) {
    msg.textContent = "⚠️ Veuillez ajouter au moins une photo.";
    return;
  }

  msg.innerHTML = "⏳ Publication et upload des photos en cours...";
  form.querySelector("button[type='submit']").disabled = true;

  try {
    /* 1️⃣ ÉTAPE 1 : Créer l'annonce dans Firestore */
    const annonceRef = await addDoc(collection(db, "annonces"), {
      title: document.getElementById("title").value.trim(),
      city: document.getElementById("city").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      postalCode: document.getElementById("postalCode").value.trim(),
      type: document.getElementById("type").value,
      price: Number(document.getElementById("price").value) || 0,
      description: document.getElementById("description").value.trim(),
      userId: currentUser.uid,
      status: "pending",
      photos: [],
      createdAt: serverTimestamp()
    });

    const photoUrls = [];

    /* 2️⃣ ÉTAPE 2 : Boucle d'upload des photos */
    for (const file of files) {
      // Nettoyage du nom de fichier pour éviter les caractères spéciaux
      const cleanName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
      const path = `annonces/${currentUser.uid}/${annonceRef.id}/${Date.now()}_${cleanName}`;
      const fileRef = ref(storage, path);

      // IMPORTANT : Ajouter le contentType pour les règles Storage
      const metadata = {
        contentType: file.type
      };

      // Lancement de l'upload
      const uploadTask = uploadBytesResumable(fileRef, file, metadata);

      // On attend la fin de l'upload
      await new Promise((resolve, reject) => {
        uploadTask.on("state_changed", 
          (snap) => {
            const progress = (snap.bytesTransferred / snap.totalBytes) * 100;
            msg.textContent = `⏳ Upload : ${Math.round(progress)}%`;
          }, 
          reject, 
          resolve
        );
      });

      // Récupérer l'URL finale
      const downloadURL = await getDownloadURL(fileRef);
      photoUrls.push(downloadURL);
    }

    /* 3️⃣ ÉTAPE 3 : Mettre à jour l'annonce avec toutes les URLs */
    await updateDoc(doc(db, "annonces", annonceRef.id), {
      photos: photoUrls,
      updatedAt: serverTimestamp()
    });

    msg.innerHTML = "<b style='color:green;'>✅ Annonce publiée avec succès !</b>";
    form.reset();
    preview.innerHTML = "";
    files = [];
    
    // Redirection après 2 secondes (optionnel)
    // setTimeout(() => { window.location.href = "mes-annonces.html"; }, 2000);

  } catch (err) {
    console.error("Erreur complète:", err);
    msg.innerHTML = `<span style='color:red;'>❌ Erreur : ${err.message}</span>`;
  } finally {
    form.querySelector("button[type='submit']").disabled = false;
  }
});
