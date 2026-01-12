import { auth, db, storage } from "../shared/firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc, getDoc, updateDoc, arrayUnion, arrayRemove
} from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  ref, uploadBytes, getDownloadURL, deleteObject
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
   PREVIEW EXISTANTES
========================= */
function renderExistingPhotos() {
  preview.innerHTML = "";

  (annonceData.photos || []).forEach(url => {
    const wrap = document.createElement("div");
    wrap.style.position = "relative";
    wrap.style.display = "inline-block";
    wrap.style.margin = "5px";

    const img = document.createElement("img");
    img.src = url;
    img.style.maxWidth = "120px";
    img.style.borderRadius = "8px";

    const btn = document.createElement("button");
    btn.textContent = "✖";
    btn.className = "btn btn-warning";
    btn.style.position = "absolute";
    btn.style.top = "4px";
    btn.style.right = "4px";
    btn.style.padding = "4px 6px";

    btn.onclick = () => deletePhoto(url);

    wrap.appendChild(img);
    wrap.appendChild(btn);
    preview.appendChild(wrap);
  });
}

/* =========================
   AUTH + ACCÈS
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
    return;
  }

  renderExistingPhotos();
});

/* =========================
   PREVIEW NOUVELLES
========================= */
input.addEventListener("change", () => {
  files = Array.from(input.files).slice(0, 6);
});

/* =========================
   UPLOAD
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
      if (!file.type.startsWith("image/")) {
        throw new Error("Image uniquement");
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Image trop lourde (5 MB max)");
      }

      const fileName = `${Date.now()}_${file.name}`;
      const path = `annonces/${userId}/${annonceId}/${fileName}`;

      const fileRef = ref(storage, path);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      await updateDoc(
        doc(db, "annonces", annonceId),
        { photos: arrayUnion(url) }
      );
    }

    const snap = await getDoc(doc(db, "annonces", annonceId));
    annonceData = snap.data();
    renderExistingPhotos();

    files = [];
    input.value = "";
    msg.textContent = "✅ Photos mises à jour";

  } catch (err) {
    console.error(err);
    msg.textContent = err.message;
  }

  saveBtn.disabled = false;
});

/* =========================
   SUPPRESSION PHOTO
========================= */
async function deletePhoto(url) {
  if (!confirm("Supprimer cette photo ?")) return;

  try {
    const fileRef = ref(storage, url);

    await deleteObject(fileRef);

    await updateDoc(
      doc(db, "annonces", annonceId),
      { photos: arrayRemove(url) }
    );

    annonceData.photos = annonceData.photos.filter(p => p !== url);
    renderExistingPhotos();

    msg.textContent = "🗑️ Photo supprimée";

  } catch (err) {
    console.error(err);
    msg.textContent = "❌ Erreur suppression photo";
  }
}
