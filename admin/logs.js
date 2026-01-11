import { db } from "../shared/firebase.js";
import { requireAdmin } from "../shared/guard.js";
import {
  collection,
  query,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const rows = document.getElementById("rows");
const msg  = document.getElementById("msg");

function fmt(ts) {
  if (!ts) return "—";
  return new Date(ts.seconds * 1000).toLocaleString("fr-FR");
}

async function loadLogs() {
  rows.innerHTML = "";
  msg.textContent = "Chargement…";

  const q = query(
    collection(db, "admin_logs"),
    orderBy("createdAt", "desc")
  );
  const res = await getDocs(q);

  if (res.empty) {
    rows.innerHTML = `<tr><td colspan="3" class="meta">Aucun log</td></tr>`;
    msg.textContent = "";
    return;
  }

  msg.textContent = `${res.size} action(s)`;
  res.forEach(d => {
    const l = d.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${fmt(l.createdAt)}</td>
      <td>${l.action}</td>
      <td>${l.annonceId}</td>
    `;
    rows.appendChild(tr);
  });
}

requireAdmin({
  onOk: loadLogs,
  onDenied: () => {
    msg.textContent = "⛔ Accès refusé";
    rows.innerHTML = "";
  }
});
