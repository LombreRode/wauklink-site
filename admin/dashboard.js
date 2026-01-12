import { db } from "../shared/firebase.js";
import { requireAdmin } from "../shared/guard.js";
import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const $ = id => document.getElementById(id);

let currentRange = 7; // par défaut : 7 jours

/* =========================
   OUTILS TEMPS
========================= */
function sinceDays(days) {
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

/* =========================
   DASHBOARD
========================= */
async function loadDashboard() {
  /* ---------- ANNONCES ---------- */
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

  /* ---------- LOGS ADMIN ---------- */
  const logsSnap = await getDocs(collection(db, "admin_logs"));

  const now = Date.now();
  const limit = sinceDays(currentRange);

  let today = 0;
  let period = 0;

  logsSnap.forEach(d => {
    const ts = d.data().createdAt?.seconds;
    if (!ts) return;

    const t = ts * 1000;

    if (now - t < 24 * 60 * 60 * 1000) today++;
    if (t >= limit) period++;
  });

  $("sToday").textContent = today;
  $("sWeek").textContent  = period;

  /* ---------- REPORTS ---------- */
  const reportsQ = query(
    collection(db, "reports"),
    where("status", "==", "pending")
  );
  const reportsSnap = await getDocs(reportsQ);
  $("sReports").textContent = reportsSnap.size;
}

/* =========================
   FILTRES TEMPS
========================= */
function initRangeButtons() {
  document
    .querySelectorAll("[data-range]")
    .forEach(btn => {
      btn.addEventListener("click", () => {
        currentRange = Number(btn.dataset.range);

        // UI active
        document
          .querySelectorAll("[data-range]")
          .forEach(b => b.classList.remove("btn-ok"));

        btn.classList.add("btn-ok");

        loadDashboard();
      });
    });
}

/* =========================
   GUARD ADMIN
========================= */
requireAdmin({
  onOk: () => {
    initRangeButtons();
    loadDashboard();
  },
  onDenied: () => {
    alert("⛔ Accès refusé");
  }
});
