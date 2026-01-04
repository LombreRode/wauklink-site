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

const input = document.getElementById("photosInput");
const preview = document.getElementById("preview");
const msg = document.getElementById("msg");
const saveBtn = document.getElementById("saveBtn");

let files = [];

if (!annonceId) {
  msg.textContent = "❌ ID annonce manquant";
  saveBtn.disabled = true;
}

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

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.replace("../auth/login.html");
    return;
  }

  const snap = await getDoc(doc(db, "annonces", annonceId));
  if (!snap.exists()) {
    msg.textContent = "❌ Annonce introuvable";
    saveBtn.disabled = true;
    return;
  }

  const annonce = snap.data();
  if (annonce.ownerUid !== user.uid) {
    msg.textContent = "⛔ Accès refusé";
    saveBtn.disabled = true;
    return;
  }
});

saveBtn.addEventListener("click", async () => {
  if (!files.length) {
    msg.textContent = "❌ Aucune photo sélectionnée";
    return;
  }

  msg.textContent = "⏳ Upload en cours…";

  try {
    for (const file of files) {
      const fileRef = ref(
        storage,
        `annonces/${annonceId}/${Date.now()}_${file.name}`
      );

      await uploadBytes(fileRef, file);
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
    msg.textContent = "❌ Erreur lors de l’upload";
  }
});
