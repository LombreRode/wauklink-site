/* ===============================
   ADMIN — FICHE ANNONCE
   (FINAL SAFE – GitHub Pages)
   =============================== */

import { db } from "/wauklink-site/shared/firebase.js";
import { requireAdmin } from "/wauklink-site/shared/guard.js";

import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ========= DOM ========= */
const msg   = document.getElementById("msg");
const box   = document.getElementById("annonceBox");

const titleEl = document.getElementById("title");
const metaEl  = document.getElementById("meta");
const descEl  = document.getElementById("description");

const photosEl = document.getElementById("photos");
const userEl   = document.getElementById("user");
const badgeEl  = document.getElementById("statusBadge");

const btnActivate = document.getElementById("btnActivate");
const btnDisable  = document.getElementById("btnDisable");
const btnDelete   = document.getElementById("btnDelete");

/* ========= PARAMS ========= */
const annonceId =
  new URLSearchParams(location.search).get("id");

if (!annonceId) {
  msg.textContent = "❌ ID annonce manquant";
}

/* ========= HELPERS ========= */
function statusLabel(status) {
  if (status === "active")   return "🟢 Active";
  if (status === "disabled") return "🟠 Désactivée";
  return "🟡 En attente";
}

function statusClass(status) {
  if (status === "active")   return "badge-ok";
  if (status === "disabled") return "badge-warning";
  return "badge-muted";
}

async function setStatus(ref, status, label) {
  if (!confirm(`Confirmer : ${label} ?`)) return;
  await updateDoc(ref, { status });
  await loadAnnonce();
}

/* ========= LOAD ANNONCE ========= */
async function loadAnnonce() {
  msg.textContent = "Chargement…";
  box.classList.add("hidden");

  try {
    const ref = doc(db, "annonces", annonceId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      msg.textContent = "❌ Annonce introuvable";
      return;
    }

    const a = snap.data();

    /* 📄 INFOS */
    titleEl.textContent = a.title || "Annonce";
    metaEl.textContent =
      `${a.type || "—"} • ${a.city || "—"} • ${a.price ?? "—"} €`;

    descEl.textContent = a.description || "";
    userEl.textContent = a.userId || "—";

    badgeEl.textContent = statusLabel(a.status);
    badgeEl.className =
      `badge ${statusClass(a.status)}`;

    /* 📷 PHOTOS */
    photosEl.innerHTML = "";

    if (Array.isArray(a.photos) && a.photos.length) {
      a.photos.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        img.alt = "Photo annonce";
        img.style.maxWidth = "140px";
        img.style.borderRadius = "8px";
        img.style.margin = "6px";
        photosEl.appendChild(img);
      });
    } else {
      photosEl.innerHTML =
        `<p class="meta">Aucune photo</p>`;
    }

    /* 🔘 ACTIONS */
    btnActivate.classList.toggle(
      "hidden",
      a.status === "active"
    );

    btnDisable.classList.toggle(
      "hidden",
      a.status !== "active"
    );

    btnActivate.onclick = () =>
      setStatus(ref, "active", "Activer l’annonce");

    btnDisable.onclick = () =>
      setStatus(ref, "disabled", "Désactiver l’annonce");

    btnDelete.onclick = async () => {
      const ok = confirm(
        "⚠️ SUPPRESSION DÉFINITIVE\n\nConfirmer ?"
      );
      if (!ok) return;

      await deleteDoc(ref);
      location.href =
        "/wauklink-site/admin/annonces.html";
    };

    msg.textContent = "";
    box.classList.remove("hidden");

  } catch (e) {
    console.error("annonce admin error:", e);
    msg.textContent = "❌ Erreur de chargement";
  }
}

/* ========= GUARD ADMIN ========= */
requireAdmin({
  onOk: loadAnnonce,
  onDenied: () => {
    msg.textContent = "⛔ Accès refusé";
    box.classList.add("hidden");
  }
});
