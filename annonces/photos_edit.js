import { auth, db, storage } from "../shared/firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc, getDoc, updateDoc, arrayUnion
} from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  ref, uploadBytes, getDownloadURL
} from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

const params = new URLSearchParams(location.search);
const annonceId = params.get("id");

const input   = document.getElementById("photosInput");
const preview = document.getElementById("preview");
const msg     = document.getElementById("msg");
const saveBtn = document.getElementById("saveBtn");

let files = [];
let annonceData = null;

/* =========================
   VÉRIFS DE BASE
========================= */
if (!annonceId) {
  msg.textContent = "❌ ID annonce manquant";
  saveBtn.disabled = true;
}

/* =========================
   PREVIEW PHOTOS
========================= */
input.addEventListener("change", () => {
  files = Array.from(input.files).slice(0, 6);
  preview.innerHTML = "";

  files.forEach(file => {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.style.maxWidth = "120px";
    img.style.margin = "5px";
    preview.appendChild(img);
  });
});

/* =========================
   AUTH + ACCÈS ANNONCE
========================= */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.replace("../auth/login.html");
    return;
  }

  const refAnnonce = doc(db, "annonces", annonceId);
  const snap = await getDoc(refAnnonce);

  if (!snap.exists()) {
    msg.textContent = "❌ Annonce introuvable";
    saveBtn.disabled = true;
    return;
  }

  annonceData = snap.data();

  if (annonceData.userId !== user.uid) {
    msg.textContent = "⛔ Accès refusé";
    saveBtn.disabled = true;
  }
});

/* =========================
   UPLOAD PHOTOS
========================= */
saveBtn.addEventListener("click", async () => {
  if (!files.length) {
    msg.textContent = "❌ Aucune photo sélectionnée";
    return;
  }

  const existing = (annonceData.photos || []).length;
  if (existing + files.length > 6) {
    msg.textContent = "❌ Maximum 6 photos par annonce";
    return;
  }

  saveBtn.disabled = true;
  msg.textContent = "⏳ Upload en cours…";

  try {
    const userId = auth.currentUser.uid;

    for (const file of files) {
      // 🔒 Sécurité UX (complément règles Storage)
      if (!file.type.startsWith("image/")) {
        throw new Error("Seules les images sont autorisées");
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Image trop lourde (max 5 MB)");
      }

      const fileName = `${Date.now()}_${file.name}`;
      const path = `annonces/${userId}/${annonceId}/${fileName}`;

      const fileRef = ref(storage, path);

      await uploadBytes(fileRef, file, {
        contentType: file.type
      });

      const url = await getDownloadURL(fileRef);

      await updateDoc(
        doc(db, "annonces", annonceId),
        { photos: arrayUnion(url) }
      );
    }

    msg.textContent = "✅ Photos enregistrées";
    files = [];
    preview.innerHTML = "";
    input.value = "";

  } catch (err) {
    console.error(err);
    msg.textContent = err.message || "❌ Erreur lors de l’upload";
  }

  saveBtn.disabled = false;
});
