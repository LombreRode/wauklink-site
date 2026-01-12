import { db } from "../shared/firebase.js";
import { requireAdmin } from "../shared/guard.js";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const msg   = document.getElementById("msg");
const box   = document.getElementById("annonceBox");
const title = document.getElementById("title");
const meta  = document.getElementById("meta");
const desc  = document.getElementById("description");
const photosEl = document.getElementById("photos");
const userEl   = document.getElementById("user");
const badge    = document.getElementById("statusBadge");

const btnActivate = document.getElementById("btnActivate");
const btnDisable  = document.getElementById("btnDisable");
const btnDelete   = document.getElementById("btnDelete");

const annonceId = new URLSearchParams(location.search).get("id");

if (!annonceId) {
  msg.textContent = "❌ ID annonce manquant";
}

/* ===== helpers statut ===== */
function statusLabel(status) {
  if (status === "active") return "🟢 Active";
  if (status === "disabled") return "🟠 Désactivée";
  return "🟡 En attente";
}

function statusClass(status) {
  if (status === "active") return "badge-ok";
  if (status === "disabled") return "badge-warning";
  return "badge-muted";
}

async function setStatus(ref, status, label) {
  if (!confirm(`Confirmer : ${label} ?`)) return;
  await updateDoc(ref, { status });
  await loadAnnonce();
}

/* ===== chargement annonce ===== */
async function loadAnnonce() {
  const ref = doc(db, "annonces", annonceId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    msg.textContent = "❌ Annonce introuvable";
    return;
  }

  const a = snap.data();

  title.textContent = a.title || "Annonce";
  meta.textContent  = `${a.type} • ${a.city} • ${a.price ?? "—"} €`;
  desc.textContent  = a.description || "";

  // ✅ CORRECTION : userId (et plus ownerUid)
  userEl.textContent = a.userId || "—";

  badge.textContent = statusLabel(a.status);
  badge.className   = `badge ${statusClass(a.status)}`;

  photosEl.innerHTML = "";
  (a.photos || []).forEach(url => {
    const img = document.createElement("img");
    img.src = url;
    img.style.borderRadius = "8px";
    photosEl.appendChild(img);
  });

  // boutons selon statut
  btnActivate.classList.toggle("hidden", a.status === "active");
  btnDisable.classList.toggle("hidden", a.status !== "active");

  btnActivate.onclick = () =>
    setStatus(ref, "active", "Activer l’annonce");

  btnDisable.onclick = () =>
    setStatus(ref, "disabled", "Désactiver l’annonce");

  btnDelete.onclick = async () => {
    if (!confirm("⚠️ Supprimer définitivement cette annonce ?")) return;
    await deleteDoc(ref);
    location.href = "/wauklink-site/admin/annonces.html";
  };

  msg.textContent = "";
  box.classList.remove("hidden");
}

requireAdmin({
  onOk: loadAnnonce,
  onDenied: () => {
    msg.textContent = "⛔ Accès refusé";
    // 📷 PHOTOS
const photosEl = document.getElementById("photos");
photosEl.innerHTML = "";

if (Array.isArray(a.photos) && a.photos.length) {
  a.photos.forEach(url => {
    const img = document.createElement("img");
    img.src = url;
    img.style.maxWidth = "140px";
    img.style.borderRadius = "8px";
    img.style.margin = "6px";
    photosEl.appendChild(img);
  });
} else {
  photosEl.innerHTML =
    `<p class="meta">Aucune photo</p>`;
}
  }
});
