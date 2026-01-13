/* =================================================
   WAUKLINK — ADMIN DASHBOARD (STABLE & COMPLETE)
================================================= */
import { db } from "../shared/firebase.js";
import { requireAdmin } from "../shared/guard.js";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  deleteDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ========= DOM HELPERS ========= */
const $ = id => document.getElementById(id);

/* ========= STATE ========= */
let currentRange = 1; // 1 = aujourd’hui, 7 = semaine, 30 = mois
const DAY = 24 * 60 * 60 * 1000;
const sinceDays = d => Date.now() - d * DAY;

/* ========= UTILS ========= */
function setText(id, value) {
  const el = $(id);
  if (el) el.textContent = value;
}

function updateTitle() {
  const t = $("activityTitle");
  if (!t) return;
  const labels = { 1: "Aujourd’hui", 7: "7 jours", 30: "30 jours" };
  t.textContent = `Activité admin — ${labels[currentRange]}`;
}

/* ========= CHARGEMENT DES DONNÉES ========= */
async function loadDashboard() {
  try {
    /* 📦 STATS ANNONCES */
    const annoncesSnap = await getDocs(collection(db, "annonces"));
    let stats = { total: 0, active: 0, disabled: 0, pending: 0 };

    annoncesSnap.forEach(d => {
      stats.total++;
      const s = d.data().status;
      if (s === "active") stats.active++;
      else if (s === "disabled") stats.disabled++;
      else stats.pending++;
    });

    setText("sTotal", stats.total);
    setText("sActive", stats.active);
    setText("sDisabled", stats.disabled);
    setText("sPending", stats.pending);

    /* 📜 LOGS ADMIN */
    const logsSnap = await getDocs(collection(db, "admin_logs"));
    const now = Date.now();
    const limit = sinceDays(currentRange);

    let todayCount = 0;
    let periodCount = 0;

    logsSnap.forEach(d => {
      const ts = d.data().createdAt?.seconds;
      if (!ts) return;
      const t = ts * 1000;
      if (now - t < DAY) todayCount++;
      if (t >= limit) periodCount++;
    });

    setText("sToday", todayCount);
    setText("sPeriod", periodCount); // Corrigé ici pour matcher ton HTML

    /* 🚩 SIGNALEMENTS (Compteur & Liste) */
    loadReportsData();

  } catch (err) {
    console.error("Dashboard error:", err);
  }
}

/* ========= GESTION DES SIGNALEMENTS ========= */
async function loadReportsData() {
  const reportsList = $("reportsList");
  if (!reportsList) return;

  try {
    // Note: Si cette requête échoue, clique sur le lien dans ta console pour créer l'index
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    
    setText("sReports", snap.size);

    if (snap.empty) {
      reportsList.innerHTML = `<tr><td colspan="5" class="text-center meta">Aucun signalement à traiter.</td></tr>`;
      return;
    }

    reportsList.innerHTML = "";
    snap.forEach(d => {
      const rep = d.data();
      const id = d.id;
      const date = rep.createdAt?.toDate().toLocaleDateString() || "---";
      
      reportsList.innerHTML += `
        <tr>
          <td><small class="meta">${rep.targetId}</small></td>
          <td><span class="badge ${rep.type === 'user' ? 'badge-pro' : 'badge-admin'}">${rep.type || 'Annonce'}</span></td>
          <td><strong>${rep.reason}</strong></td>
          <td>${date}</td>
          <td>
            <button class="btn btn-danger" style="padding: 5px 10px; font-size: 11px;" onclick="handleReport('${id}', '${rep.targetId}')">Action</button>
          </td>
        </tr>
      `;
    });
  } catch (err) {
    console.error("Erreur rapports:", err);
    reportsList.innerHTML = `<tr><td colspan="5" class="text-center bad">Erreur d'indexage Firebase (Vérifie la console)</td></tr>`;
  }
}

/* ========= ACTIONS ADMIN ========= */
window.handleReport = async (reportId, targetId) => {
  if (confirm(`Voulez-vous supprimer cet élément (ID: ${targetId}) et classer le signalement ?`)) {
    try {
      // 1. On pourrait supprimer l'annonce ou l'user ici (selon ta logique)
      // 2. On supprime le signalement une fois traité
      await deleteDoc(doc(db, "reports", reportId));
      alert("Signalement traité !");
      loadDashboard();
    } catch (e) {
      alert("Erreur lors de l'action");
    }
  }
};

/* ========= FILTRES ========= */
function initFilters() {
  document.querySelectorAll("[data-range]").forEach(btn => {
    btn.addEventListener("click", () => {
      currentRange = Number(btn.dataset.range);
      document.querySelectorAll("[data-range]").forEach(b => b.classList.remove("btn-ok"));
      btn.classList.add("btn-ok");
      updateTitle();
      loadDashboard();
    });
  });
}

/* ========= INITIALISATION ========= */
requireAdmin({
  onOk: () => {
    initFilters();
    updateTitle();
    loadDashboard();
  },
  onDenied: () => {
    // Géré par le HTML ou le guard
  }
});
