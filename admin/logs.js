import { db } from "../shared/firebase.js";
import { requireAdmin } from "../shared/guard.js";
import {
  collection,
  query,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ========= DOM ========= */
const rows = document.getElementById("rows");
const msg  = document.getElementById("msg");

const fAction = document.getElementById("fAction");
const fAdmin  = document.getElementById("fAdmin");
const fDate   = document.getElementById("fDate");

const btnFilter = document.getElementById("btnFilter");
const btnReset  = document.getElementById("btnReset");
const btnCsv    = document.getElementById("btnCsv");

/* ========= STATE ========= */
let allLogs = [];

/* ========= HELPERS ========= */
const fmtDate = ts =>
  ts?.seconds
    ? new Date(ts.seconds * 1000).toLocaleString("fr-FR")
    : "—";

function badge(action) {
  if (action === "activate")
    return `<span class="badge b-act">🟢 Activation</span>`;
  if (action === "disable")
    return `<span class="badge b-dis">🟠 Désactivation</span>`;
  if (action === "delete")
    return `<span class="badge b-del">🔴 Suppression</span>`;
  return action || "—";
}

/* ========= FILTER ========= */
function applyFilters() {
  const A = fAction.value;
  const E = fAdmin.value.trim().toLowerCase();
  const D = fDate.value; // yyyy-mm-dd

  rows.innerHTML = "";

  const list = allLogs.filter(l => {
    if (A && l.action !== A) return false;

    const admin =
      (l.adminEmail || l.admin || "").toLowerCase();
    if (E && !admin.includes(E)) return false;

    if (D && l.createdAt?.seconds) {
      const d = new Date(l.createdAt.seconds * 1000)
        .toISOString()
        .slice(0, 10);
      if (d !== D) return false;
    }

    return true;
  });

  if (!list.length) {
    rows.innerHTML =
      `<tr><td colspan="4" class="meta">Aucun historique</td></tr>`;
    msg.textContent = "";
    return;
  }

  msg.textContent = `${list.length} action(s)`;

  list.forEach(l => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${fmtDate(l.createdAt)}</td>
      <td>${l.adminEmail || l.admin || "—"}</td>
      <td>${badge(l.action)}</td>
      <td>${l.annonceTitle || l.annonceId || "—"}</td>
    `;
    rows.appendChild(tr);
  });
}

/* ========= LOAD ========= */
async function loadLogs() {
  rows.innerHTML = "";
  msg.textContent = "Chargement…";

  const q = query(
    collection(db, "admin_logs"),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  allLogs = snap.docs.map(d => d.data());

  applyFilters();
}

/* ========= CSV ========= */
function exportCSV() {
  if (!allLogs.length) {
    alert("Aucune donnée à exporter");
    return;
  }

  const headers = ["Date", "Admin", "Action", "Annonce"];
  const csvRows = [];

  const A = fAction.value;
  const E = fAdmin.value.trim().toLowerCase();
  const D = fDate.value;

  allLogs.forEach(l => {
    if (A && l.action !== A) return;

    const admin =
      (l.adminEmail || l.admin || "").toLowerCase();
    if (E && !admin.includes(E)) return;

    if (D && l.createdAt?.seconds) {
      const d = new Date(l.createdAt.seconds * 1000)
        .toISOString()
        .slice(0, 10);
      if (d !== D) return;
    }

    csvRows.push([
      fmtDate(l.createdAt),
      l.adminEmail || l.admin || "",
      l.action || "",
      l.annonceTitle || l.annonceId || ""
    ]);
  });

  let csv = headers.join(";") + "\n";
  csvRows.forEach(r => {
    csv += r
      .map(v => `"${String(v).replace(/"/g, '""')}"`)
      .join(";") + "\n";
  });

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "historique-admin.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/* ========= EVENTS ========= */
btnFilter.onclick = applyFilters;

btnReset.onclick = () => {
  fAction.value = "";
  fAdmin.value  = "";
  fDate.value   = "";
  applyFilters();
};

btnCsv.onclick = exportCSV;

/* ========= GUARD ========= */
requireAdmin({
  onOk: loadLogs,
  onDenied: () => {
    msg.textContent = "⛔ Accès refusé";
    rows.innerHTML = "";
  }
});
