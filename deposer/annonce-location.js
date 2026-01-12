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
} from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  ref,
  uploadBytes,
  getDownloadURL
} from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

/* =========================
   DOM
========================= */
const form = document.getElementById("annonceForm");
const msg  = document.getElementById("msg");
const planBlock = document.getElementById("planBlock");

const title = document.getElementById("title");
const city = document.getElementById("city");
const phone = document.getElementById("phone");
const postalCode = document.getElementById("postalCode");
const type = document.getElementById("type");
const price = document.getElementById("price");
const description = document.getElementById("description");

const photosInput = document.getElementById("photosInput");
const preview = document.getElementById("preview");

let currentUser = null;
let files = [];

/* =========================
   PREVIEW PHOTOS
========================= */
photosInput.addEventListener("change", () => {
  files = Array.from(photosInput.files).slice(0, 6);
  preview.innerHTML = "";

  files.forEach(file => {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.style.maxWidth = "120px";
    img.style.margin = "6px";
    img.style.borderRadius = "8px";
    preview.appendChild(img);
  });
});

/* =========================
   AUTH + ACCÈS
========================= */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = "/wauklink-site/auth/login.html";
    return;
  }

  currentUser = user;

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) {
    msg.textContent = "❌ Profil utilisateur introuvable";
    return;
  }

  const role = snap.data().role;
  if (!["particulier", "professionnel", "admin"].includes(role)) {
    planBlock.classList.remove("hidden");
    form.classList.add("hidden");
    return;
  }

  form.classList.remove("hidden");
});

/* =========================
   SUBMIT
========================= */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "⏳ Publication en cours…";

  try {
    if (!title.value || !city.value || !type.value || !description.value) {
      msg.textContent = "❌ Champs obligatoires manquants";
      return;
    }

    if (files.length > 6) {
      msg.textContent = "❌ Maximum 6 photos";
      return;
    }

    // 1️⃣ Création annonce
    const docRef = await addDoc(collection(db, "annonces"), {
      title: title.value.trim(),
      city: city.value.trim(),
      phone: phone.value.trim(),
      postalCode: postalCode.value.trim(),
      type: type.value,
      price: price.value ? Number(price.value) : null,
      description: description.value.trim(),
      userId: currentUser.uid,
      status: "pending",
      createdAt: serverTimestamp(),
      photos: []
    });

    // 2️⃣ Upload photos
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) continue;

      const path = `annonces/${docRef.id}/${Date.now()}_${file.name}`;
      const fileRef = ref(storage, path);

      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      await updateDoc(doc(db, "annonces", docRef.id), {
        photos: arrayUnion(url)
      });
    }

    msg.textContent = "✅ Annonce publiée avec photos";
    form.reset();
    preview.innerHTML = "";
    files = [];

  } catch (err) {
    console.error(err);
    msg.textContent = "❌ Erreur lors de la publication";
  }
});
