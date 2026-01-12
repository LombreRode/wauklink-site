/* =================================================
   DÉPOSER UNE ANNONCE — VERSION STABLE (OK PROD)
   ================================================= */
import { auth, db, storage } from "../shared/firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

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
const form        = document.getElementById("annonceForm");
const msg         = document.getElementById("msg");
const planBlock   = document.getElementById("planBlock");
const titleEl     = document.getElementById("title");
const cityEl      = document.getElementById("city");
const phoneEl     = document.getElementById("phone");
const postalEl    = document.getElementById("postalCode");
const typeEl      = document.getElementById("type");
const priceEl     = document.getElementById("price");
const descEl      = document.getElementById("description");
const photosInput = document.getElementById("photosInput");
const preview     = document.getElementById("preview");

let currentUser = null;
let files = [];

/* =========================
   PREVIEW
========================= */
photosInput.addEventListener("change", () => {
  files = Array.from(photosInput.files).slice(0, 6);
  preview.innerHTML = "";
  files.forEach(file => {
    if (!file.type.startsWith("image/")) return;
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.style.maxWidth = "120px";
    img.style.margin = "6px";
    img.style.borderRadius = "8px";
    preview.appendChild(img);
  });
});

/* =========================
   AUTH
========================= */
onAuthStateChanged(auth, async user => {
  if (!user) {
    location.replace("/wauklink-site/auth/login.html");
    return;
  }
  currentUser = user;

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) {
    msg.textContent = "❌ Profil utilisateur introuvable";
    return;
  }

  form.classList.remove("hidden");
});

/* =========================
   SUBMIT
========================= */
form.addEventListener("submit", async e => {
  e.preventDefault();
  msg.textContent = "⏳ Publication en cours…";

  try {
    /* 1️⃣ Création annonce */
    const annonceRef = await addDoc(collection(db, "annonces"), {
      title: titleEl.value.trim(),
      city: cityEl.value.trim(),
      phone: phoneEl.value.trim(),
      postalCode: postalEl.value.trim(),
      type: typeEl.value,
      price: priceEl.value ? Number(priceEl.value) : null,
      description: descEl.value.trim(),
      userId: currentUser.uid,
      status: "pending",
      photos: [],
      createdAt: serverTimestamp()
    });

    /* 2️⃣ Upload photos (SANS CORS) */
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) continue;

      const path =
        `annonces/${currentUser.uid}/${annonceRef.id}/${Date.now()}_${file.name}`;

      const fileRef = ref(storage, path);

      const task = uploadBytesResumable(fileRef, file);

      await new Promise((resolve, reject) => {
        task.on("state_changed", null, reject, resolve);
      });

      const url = await getDownloadURL(fileRef);

      await updateDoc(doc(db, "annonces", annonceRef.id), {
        photos: arrayUnion(url),
        updatedAt: serverTimestamp()
      });
    }

    msg.textContent = "✅ Annonce envoyée en validation";
    form.reset();
    preview.innerHTML = "";
    files = [];

  } catch (err) {
    console.error(err);
    msg.textContent = "❌ Erreur lors de la publication";
  }
});
