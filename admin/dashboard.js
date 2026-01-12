/* ===============================
   ADMIN — DASHBOARD (STABLE & SAFE)
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

/* ========= TIME ========= */
const DAY = 24 * 60 * 60 * 1000;
const sinceDays = d => Date.now() - d * DAY;

/* ========= TITLE ========= */
function updateTitle() {
  const t = $("activityTitle");
  if (!t) return;
  t.textContent =
    currentRange === 1
      ? "Activité admin — Aujourd’hui"
      : currentRange === 7
      ? "Activité admin — 7 jours"
      : "Activité admin — 30 jours";
}

/* ========= SAFE SET ========= */
function setText(id, value) {
  const el = $(id);
  if (el) el.textContent = value;
}

/* ========= DASHBOARD ========= */
async function loadDashboard() {
  try {
    /* 📦 ANNONCES */
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

    let today = 0;
    let period = 0;

    logsSnap.forEach(d => {
      const ts = d.data().createdAt?.seconds;
      if (!ts) return;
      const t = ts * 1000;
      if (now - t < DAY) today++;
      if (t >= limit) period++;
    });

    setText("sToday", today);
    setText("sWeek", period);

    /* 🚩 REPORTS */
    const reportsSnap = await getDocs(
      query(collection(db, "reports"), where("status", "==", "pending"))
    );
    setText("sReports", reportsSnap.size);

  } catch (err) {
    console.error("Dashboard error:", err);
    alert("❌ Erreur lors du chargement du dashboard");
  }
}

/* ========= FILTERS ========= */
function initFilters() {
  document.querySelectorAll("[data-range]").forEach(btn => {
    btn.addEventListener("click", () => {
      currentRange = Number(btn.dataset.range);
      document
        .querySelectorAll("[data-range]")
        .forEach(b => b.classList.remove("btn-ok"));
      btn.classList.add("btn-ok");
      setText("sToday", "—");
      setText("sWeek", "—");
      updateTitle();
      loadDashboard();
    });
  });
}

/* ========= GUARD ========= */
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
        <p class="meta">Administrateurs uniquement</p>
        <a class="btn" href="/wauklink-site/index.html">Accueil</a>
      </main>
    `;
  }
});
