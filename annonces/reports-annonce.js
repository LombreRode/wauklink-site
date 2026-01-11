import { db } from "../shared/firebase.js";
import { requireModerator } from "../shared/guard.js";
import {
  collection, getDocs, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const list  = document.getElementById("list");
const empty = document.getElementById("empty");

const esc = s =>
  String(s ?? "").replace(/[&<>"']/g, m =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m])
  );

async function loadReports() {
  list.innerHTML = "";

  const q = query(
    collection(db, "reports"),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    empty.classList.remove("hidden");
    return;
  }

  snap.forEach(d => {
    const r = d.data();
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <div><strong>Annonce :</strong> ${esc(r.annonceId)}</div>
      <div><strong>Motif :</strong> ${esc(r.reason)}</div>
      <div class="meta">
        Signalé par ${esc(r.reporterEmail || "inconnu")}
      </div>
    `;
    list.appendChild(div);
  });
}

// 🔒 accès modérateur uniquement
requireModerator({
  redirectTo: "../auth/login.html",
  onOk: loadReports
});
