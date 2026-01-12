import { db } from "../shared/firebase.js";
import { requireAdmin } from "../shared/guard.js";
import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const $ = id => document.getElementById(id);

async function loadDashboard() {
  // 📦 ANNONCES
  const annoncesSnap = await getDocs(collection(db, "annonces"));
  let total = 0, active = 0, disabled = 0, pending = 0;

  annoncesSnap.forEach(d => {
    total++;
    const s = d.data().status;
    if (s === "active") active++;
    else if (s === "disabled") disabled++;
    else pending++;
  });

  $("sTotal").textContent   = total;
  $("sActive").textContent  = active;
  $("sDisabled").textContent= disabled;
  $("sPending").textContent = pending;

  // 📜 LOGS ADMIN
  const logsSnap = await getDocs(collection(db, "admin_logs"));
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  let today = 0, week = 0;

  logsSnap.forEach(d => {
    const t = d.data().createdAt?.seconds * 1000;
    if (!t) return;
    if (now - t < day) today++;
    if (now - t < 7 * day) week++;
  });

  $("sToday").textContent = today;
  $("sWeek").textContent  = week;

  // 🚩 REPORTS
  const reportsQ = query(
    collection(db, "reports"),
    where("status", "==", "pending")
  );
  const reportsSnap = await getDocs(reportsQ);
  $("sReports").textContent = reportsSnap.size;
}

requireAdmin({
  onOk: loadDashboard,
  onDenied: () => alert("Accès refusé")
});
