import { auth, db } from "../shared/firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc
} from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* =========================
   ÉLÉMENTS DOM
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

/* =========================
   AUTH + ACCÈS
========================= */
let currentUser = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = "/wauklink-site/auth/login.html";
    return;
  }

  currentUser = user;

  // 🔐 Vérifier rôle utilisateur
  const userSnap = await getDoc(doc(db, "users", user.uid));

  if (!userSnap.exists()) {
    msg.textContent = "❌ Profil utilisateur introuvable";
    return;
  }

  const role = userSnap.data().role;

  if (!["particulier", "professionnel", "admin"].includes(role)) {
    planBlock.classList.remove("hidden");
    form.classList.add("hidden");
    return;
  }

  // ✅ Accès autorisé
  form.classList.remove("hidden");
});

/* =========================
   SOUMISSION FORMULAIRE
========================= */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  msg.textContent = "⏳ Publication en cours…";

  try {
    // 🔎 Validation minimale
    if (!title.value || !city.value || !type.value || !description.value) {
      msg.textContent = "❌ Champs obligatoires manquants";
      return;
    }

    // 📦 Création annonce
    const docRef = await addDoc(collection(db, "annonces"), {
      title: title.value.trim(),
      city: city.value.trim(),
      phone: phone.value.trim(),
      postalCode: postalCode.value.trim(),
      type: type.value,
      price: price.value ? Number(price.value) : null,
      description: description.value.trim(),

      userId: currentUser.uid,
      status: "pending",           // 🔒 validation admin
      createdAt: serverTimestamp(),// ⏱️ essentiel
      photos: []                   // 📷 initial vide
    });

    // ➜ REDIRECTION PHOTOS
    location.href =
      `/wauklink-site/annonces/photos_edit.html?id=${docRef.id}`;

  } catch (err) {
    console.error(err);
    msg.textContent = "❌ Erreur lors de la publication";
  }
});
