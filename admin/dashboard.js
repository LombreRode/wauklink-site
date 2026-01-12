/* ===============================
   ADMIN — DASHBOARD (STABLE)
   =============================== */

import { db } from "../shared/firebase.js";
import { requireAdmin } from "../shared/guard.js";
import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ========= DOM ========= */
const $ = id => document.getElementById(id);

/* ========= STATE ========= */
let currentRange = 1; // 1 = aujourd’hui, 7 = semaine, 30 = mois

/* ========= UTILS TEMPS ========= */
function sinceDays(days) {
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

/* ========= TITRE ========= */
function updateTitle() {
  const title = $("activityTitle");
  if (!title) return;

  if (currentRange === 1) {
    title.textContent = "Activité admin — Aujourd’hui";
  } else if (currentRange === 7) {
    title.textContent = "Activité admin — 7 jours";
  } else {
    title.textContent = "Activité admin — 30 jours";
  }
}

/* ========= DASHBOARD ========= */
async function loadDashboard() {
  try {
    /* 📦 ANNONCES */
    const annoncesSnap = await getDocs(collection(db, "annonces"));
    let total = 0, active = 0, disabled = 0, pending = 0;

    annoncesSnap.forEach(d => {
      total++;
      const s = d.data().status;
      if (s === "active") active++;
      else if (s === "disabled") disabled++;
      else pending++;
    });

    $("sTotal").textContent    = total;
    $("sActive").textContent   = active;
    $("sDisabled").textContent = disabled;
    $("sPending").textContent  = pending;

    /* 📜 LOGS ADMIN */
    const logsSnap = await getDocs(collection(db, "admin_logs"));
    const limitTs = sinceDays(currentRange);
    const now = Date.now();

    let today = 0;
    let period = 0;

    logsSnap.forEach(d => {
      const ts = d.data().createdAt?.seconds;
      if (!ts) return;

      const t = ts * 1000;
      if (now - t < 24 * 60 * 60 * 1000) today++;
      if (t >= limitTs) period++;
    });

    $("sToday").textContent = today;
    $("sWeek").textContent  = period;

    /* 🚩 REPORTS */
    const reportsQ = query(
      collection(db, "reports"),
      where("status", "==", "pending")
    );
    const reportsSnap = await getDocs(reportsQ);
    $("sReports").textContent = reportsSnap.size;

  } catch (err) {
    console.error("❌ Dashboard error:", err);
    alert("Erreur lors du chargement du dashboard admin");
  }
}

/* ========= FILTRES TEMPS ========= */
function initFilters() {
  document.querySelectorAll("[data-range]").forEach(btn => {
    btn.addEventListener("click", () => {
      currentRange = Number(btn.dataset.range);

      // UI active
      document
        .querySelectorAll("[data-range]")
        .forEach(b => b.classList.remove("btn-ok"));
      btn.classList.add("btn-ok");

      // reset affichage
      $("sToday").textContent = "—";
      $("sWeek").textContent  = "—";

      updateTitle();
      loadDashboard();
    });
  });
}

/* ========= GUARD ADMIN ========= */
requireAdmin({
  onOk: () => {
    initFilters();
    updateTitle();
    loadDashboard();
  },
  onDenied: () => {
    document.body.innerHTML = `
      <main class="container main-layout">
        <h2>⛔ Accès refusé</h2>
        <p class="meta">Page réservée aux administrateurs</p>
        <a class="btn" href="/wauklink-site/index.html">Accueil</a>
      </main>
    `;
  }
});
