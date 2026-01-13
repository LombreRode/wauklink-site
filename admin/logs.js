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
const esc = s => String(s ?? "").replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));

const fmtDate = ts => ts?.seconds ? new Date(ts.seconds * 1000).toLocaleString("fr-FR") : "—";

function badge(action) {
  // Adaptation aux nouvelles actions de modération
  if (action === "user_unbanned" || action === "activate") 
    return `<span class="badge b-act">🟢 Débanni/Activé</span>`;
  if (action === "user_plan_change") 
    return `<span class="badge b-dis">💎 Plan Modifié</span>`;
  if (action === "user_banned" || action === "delete") 
    return `<span class="badge b-del">🔴 Banni/Supprimé</span>`;
  if (action === "report_closed")
    return `<span class="badge b-act">📁 Signalement traité</span>`;
    
  return `<span class="badge" style="background:#eee">${esc(action)}</span>`;
}

/* ========= FILTER & RENDER ========= */
function applyFilters() {
  const A = fAction.value;
  const E = fAdmin.value.trim().toLowerCase();
  const D = fDate.value;

  rows.innerHTML = "";

  const list = allLogs.filter(l => {
    if (A && l.action !== A) return false;
    const admin = (l.adminEmail || l.admin || "").toLowerCase();
    if (E && !admin.includes(E)) return false;

    if (D && l.createdAt?.seconds) {
      const d = new Date(l.createdAt.seconds * 1000).toISOString().slice(0, 10);
      if (d !== D) return false;
    }
    return true;
  });

  if (!list.length) {
    rows.innerHTML = `<tr><td colspan="4" class="meta">Aucun historique trouvé</td></tr>`;
    msg.textContent = "";
    return;
  }

  msg.textContent = `${list.length} action(s) affichée(s)`;

  list.forEach(l => {
    const tr = document.createElement("tr");
    
    // On cherche l'info de la cible (soit targetEmail, soit titre annonce)
    const cible = l.extra?.targetEmail || l.extra?.targetId || l.annonceTitle || l.annonceId || "—";
    const detail = l.extra?.newPlan ? ` (Vers: ${l.extra.newPlan})` : "";

    tr.innerHTML = `
      <td>${fmtDate(l.createdAt)}</td>
      <td><small>${esc(l.adminEmail || l.admin || "—")}</small></td>
      <td>${badge(l.action)}</td>
      <td>${esc(cible)}${esc(detail)}</td>
    `;
    rows.appendChild(tr);
  });
}

/* ========= LOAD DATA ========= */
async function loadLogs() {
  rows.innerHTML = "";
  msg.textContent = "⏳ Chargement…";

  try {
    const q = query(collection(db, "admin_logs"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    allLogs = snap.docs.map(d => d.data());
    applyFilters();
  } catch (err) {
    console.error(err);
    msg.innerHTML = "❌ Erreur de chargement. Vérifiez vos index Firestore.";
  }
}

/* ========= EXPORT CSV (Excel) ========= */
function exportCSV() {
  if (!allLogs.length) {
    alert("Aucune donnée à exporter");
    return;
  }

  const headers = ["Date", "Admin", "Action", "Cible", "Details"];
  const csvRows = [];

  allLogs.forEach(l => {
    const d = l.createdAt?.seconds ? new Date(l.createdAt.seconds * 1000).toISOString().slice(0, 10) : "";
    
    // On applique les filtres actuels à l'export aussi
    if (fAction.value && l.action !== fAction.value) return;
    if (fDate.value && d !== fDate.value) return;

    csvRows.push([
      fmtDate(l.createdAt),
      l.adminEmail || l.admin || "",
      l.action || "",
      l.extra?.targetEmail || l.annonceId || "",
      l.extra?.newPlan || ""
    ]);
  });

  let csv = headers.join(";") + "\n";
  csvRows.forEach(r => {
    csv += r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(";") + "\n";
  });

  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `wauklink-logs-${new Date().toISOString().slice(0,10)}.csv`;
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

/* ========= INITIALISATION ========= */
requireAdmin({
  onOk: loadLogs,
  onDenied: () => {
    msg.textContent = "⛔ Accès refusé";
    rows.innerHTML = "";
  }
});
