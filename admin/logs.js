import { db } from "../shared/firebase.js";
import { requireAdmin } from "../shared/guard.js";
import {
  collection, query, orderBy, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const rows = document.getElementById("rows");
const msg  = document.getElementById("msg");
const fAction = document.getElementById("fAction");
const fAdmin  = document.getElementById("fAdmin");
const fDate   = document.getElementById("fDate");
const btnFilter = document.getElementById("btnFilter");
const btnReset  = document.getElementById("btnReset");

let all = [];

const fmt = ts => ts ? new Date(ts.seconds*1000).toLocaleString("fr-FR") : "—";
const badge = a =>
  a==="activate" ? `<span class="badge b-act">🟢 activate</span>` :
  a==="disable"  ? `<span class="badge b-dis">🟠 disable</span>` :
  a==="delete"   ? `<span class="badge b-del">🔴 delete</span>` :
  a;

function applyFilters(){
  const A = fAction.value;
  const E = fAdmin.value.trim().toLowerCase();
  const D = fDate.value; // yyyy-mm-dd

  rows.innerHTML = "";
  let list = all.filter(l=>{
    if (A && l.action!==A) return false;
    if (E && !(l.admin||"").toLowerCase().includes(E)) return false;
    if (D){
      const d = new Date(l.createdAt.seconds*1000).toISOString().slice(0,10);
      if (d!==D) return false;
    }
    return true;
  });

  if (!list.length){
    rows.innerHTML = `<tr><td colspan="4" class="meta">Aucun historique</td></tr>`;
    msg.textContent = "";
    return;
  }

  msg.textContent = `${list.length} action(s)`;
  list.forEach(l=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${fmt(l.createdAt)}</td>
      <td>${l.admin || "—"}</td>
      <td>${badge(l.action)}</td>
      <td>${l.annonceTitle || l.annonceId || "—"}</td>
    `;
    rows.appendChild(tr);
  });
}

async function load(){
  rows.innerHTML = "";
  msg.textContent = "Chargement…";
  const q = query(collection(db,"admin_logs"), orderBy("createdAt","desc"));
  const res = await getDocs(q);
  all = res.docs.map(d=>d.data());
  applyFilters();
}

btnFilter.onclick = applyFilters;
btnReset.onclick = ()=>{
  fAction.value=""; fAdmin.value=""; fDate.value="";
  applyFilters();
};

requireAdmin({
  onOk: load,
  onDenied: ()=>{
    msg.textContent = "⛔ Accès refusé";
    rows.innerHTML = "";
  }
});

const btnCsv = document.getElementById("btnCsv");

function exportCSV() {
  if (!all.length) return alert("Aucune donnée à exporter");

  const headers = ["Date", "Admin", "Action", "Annonce"];
  const rows = [];

  // on réutilise EXACTEMENT les filtres actifs
  const A = fAction.value;
  const E = fAdmin.value.trim().toLowerCase();
  const D = fDate.value;

  all.forEach(l => {
    if (A && l.action !== A) return;
    if (E && !(l.admin || "").toLowerCase().includes(E)) return;
    if (D) {
      const d = new Date(l.createdAt.seconds * 1000)
        .toISOString().slice(0,10);
      if (d !== D) return;
    }

    rows.push([
      new Date(l.createdAt.seconds * 1000).toLocaleString("fr-FR"),
      l.admin || "",
      l.action,
      l.annonceTitle || l.annonceId || ""
    ]);
  });

  let csv = headers.join(";") + "\n";
  rows.forEach(r => {
    csv += r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(";") + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "historique-admin.csv";
  a.click();

  URL.revokeObjectURL(url);
}

btnCsv.onclick = exportCSV;
