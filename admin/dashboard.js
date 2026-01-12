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
  let currentRange = 1; // par défaut : aujourd’hui

function getRangeLimit(days) {
  const now = Date.now();
  return now - days * 24 * 60 * 60 * 1000;
}

async function loadAdminActivity() {
  const logsSnap = await getDocs(collection(db, "admin_logs"));
  const limit = getRangeLimit(currentRange);

  let count = 0;

  logsSnap.forEach(d => {
    const t = d.data().createdAt?.seconds * 1000;
    if (!t) return;
    if (t >= limit) count++;
  });

  $("sToday").textContent = currentRange === 1 ? count : "—";
  $("sWeek").textContent  = count;
}

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
