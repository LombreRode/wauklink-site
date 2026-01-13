// admin/annonce.js
import { db, auth, storage } from "/wauklink-site/shared/firebase.js"; // Ajout de storage ici
import { requireAdmin } from "/wauklink-site/shared/guard.js";
import { logAdminAction } from "/wauklink-site/shared/admin_logger.js";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
// Ajout de ref et deleteObject pour nettoyer les photos
import { ref, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

/* ========= DOM ========= */
const msg    = document.getElementById("msg");
const box    = document.getElementById("annonceBox");
const titleEl = document.getElementById("title");
const metaEl  = document.getElementById("meta");
const descEl  = document.getElementById("description");
const photosEl = document.getElementById("photos");
const userEl   = document.getElementById("user");
const badgeEl  = document.getElementById("statusBadge");
const btnActivate = document.getElementById("btnActivate");
const btnDisable  = document.getElementById("btnDisable");
const btnDelete   = document.getElementById("btnDelete");

/* ========= PARAM ========= */
const annonceId = new URLSearchParams(location.search).get("id");
if (!annonceId) {
  msg.textContent = "❌ ID annonce manquant";
}

let photoUrls = []; // On va stocker les URLs ici pour la suppression

/* ========= HELPERS ========= */
const lockButtons = (v) => {
  btnActivate.disabled = v;
  btnDisable.disabled  = v;
  btnDelete.disabled   = v;
};

function statusLabel(s) {
  if (s === "active") return "🟢 Active";
  if (s === "disabled") return "🟠 Désactivée";
  return "🟡 En attente";
}
function statusClass(s) {
  if (s === "active") return "badge-ok";
  if (s === "disabled") return "badge-warning";
  return "badge-muted";
}

async function setStatus(ref, status, label) {
  if (!confirm(`Confirmer : ${label} ?`)) return;
  lockButtons(true);
  try {
    await updateDoc(ref, { status });
    await logAdminAction({
      action: status === "active" ? "activate" : "disable",
      adminUid: auth.currentUser?.uid,
      adminEmail: auth.currentUser?.email,
      annonceId
    });
    await loadAnnonce();
    alert("✅ Statut mis à jour");
  } catch (e) {
    console.error("status update error:", e);
    alert("❌ Erreur : vérifiez vos règles Firestore Admin");
    lockButtons(false);
  }
}

/* ========= LOAD ========= */
async function loadAnnonce() {
  msg.textContent = "Chargement…";
  box.classList.add("hidden");

  try {
    const annonceRef = doc(db, "annonces", annonceId);
    const snap = await getDoc(annonceRef);
    if (!snap.exists()) {
      msg.textContent = "❌ Annonce introuvable";
      return;
    }

    const a = snap.data();
    photoUrls = a.photos || []; // On récupère les photos pour plus tard

    titleEl.textContent = a.title || "Annonce";
    metaEl.textContent =
      `${a.type || "—"} • ${a.city || "—"} • ${a.price ?? "—"} €`;
    descEl.textContent = a.description || "";
    userEl.textContent = a.userId || "—";

    badgeEl.textContent = statusLabel(a.status);
    badgeEl.className = `badge ${statusClass(a.status)}`;

    photosEl.innerHTML = "";
    if (photoUrls.length) {
      photoUrls.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        img.style.maxWidth = "140px";
        img.style.borderRadius = "8px";
        img.style.margin = "6px";
        photosEl.appendChild(img);
      });
    } else {
      photosEl.innerHTML = `<p class="meta">Aucune photo</p>`;
    }

    btnActivate.classList.toggle("hidden", a.status === "active");
    btnDisable.classList.toggle("hidden", a.status !== "active");

    btnActivate.onclick = () => setStatus(annonceRef, "active", "Activer l’annonce");
    btnDisable.onclick = () => setStatus(annonceRef, "disabled", "Désactiver l’annonce");

    /* ========= SUPPRESSION TOTALE ========= */
    btnDelete.onclick = async () => {
      if (!confirm("⚠️ SUPPRESSION DÉFINITIVE (Photos + Annonce)\n\nConfirmer ?")) return;
      lockButtons(true);
      
      try {
        // 1. Supprimer les fichiers dans Storage
        for (const url of photoUrls) {
          try {
            const fileRef = ref(storage, url);
            await deleteObject(fileRef);
          } catch (err) {
            console.warn("Fichier Storage introuvable ou déjà supprimé");
          }
        }

        // 2. Supprimer le
