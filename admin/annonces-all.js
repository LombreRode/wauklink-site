import { db } from "../shared/firebase.js";
import { requireAdmin } from "../shared/guard.js";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const rows = document.getElementById("rows");
const msg  = document.getElementById("msg");

const filterType   = document.getElementById("filterType");
const filterStatus = document.getElementById("filterStatus");
const filterCity   = document.getElementById("filterCity");
const btnFilter    = document.getElementById("btnFilter");
const btnReset     = document.getElementById("btnReset");

const esc = s =>
  String(s ?? "").replace(/[&<>"']/g, m =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m])
  );

function badge(status) {
  if (status === "active") return "🟢 active";
  if (status === "disabled") return "🟠 désactivée";
  return "🟡 en attente";
}

async function loadAll(filters = {}) {
  rows.innerHTML = "";
  msg.textContent = "Chargement…";

  try {
    const constraints = [orderBy("createdAt", "desc")];

    if (filters.type) {
      constraints.unshift(where("type", "==", filters.type));
    }
    if (filters.status) {
      constraints.unshift(where("status", "==", filters.status));
    }
    if (filters.city) {
      constraints.unshift(where("city", "==", filters.city));
    }

    const q = query(collection(db, "annonces"), ...constraints);
    const res = await getDocs(q);

    if (res.empty) {
      rows.innerHTML =
        `<tr><td colspan="6" class="meta">Aucune annonce</td></tr>`;
      msg.textContent = "";
      return;
    }

    msg.textContent = `${res.size} annonce(s)`;

    res.forEach(d => {
      const a = d.data();
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${esc(a.title)}</td>
        <td>${esc(a.city)}</td>
        <td>${esc(a.type)}</td>
        <td>${a.price ?? "-"}</td>
        <td>${badge(a.status)}</td>
        <td>
          <a class="btn btn-outline"
             href="/wauklink-site/admin/annonce.html?id=${d.id}">
            Voir
          </a>
          <button class="btn btn-warning">Désactiver</button>
          <button class="btn btn-ok">Activer</button>
          <button class="btn btn-danger">Supprimer</button>
        </td>
      `;

      const [btnDisable, btnActivate, btnDelete] =
        tr.querySelectorAll("button");

      btnDisable.onclick = async () => {
        if (!confirm("Désactiver cette annonce ?")) return;
        await updateDoc(doc(db, "annonces", d.id), { status: "disabled" });
        tr.children[4].textContent = badge("disabled");
      };

      btnActivate.onclick = async () => {
        if (!confirm("Activer cette annonce ?")) return;
        await updateDoc(doc(db, "annonces", d.id), { status: "active" });
        tr.children[4].textContent = badge("active");
      };

      btnDelete.onclick = async () => {
        if (!confirm("⚠️ Supprimer définitivement cette annonce ?")) return;
        await deleteDoc(doc(db, "annonces", d.id));
        tr.remove();
      };

      rows.appendChild(tr);
    });

  } catch (e) {
    console.error(e);
    msg.textContent = "❌ Erreur de chargement";
    rows.innerHTML = "";
  }
}

// 🔘 actions filtres
btnFilter.onclick = () => {
  loadAll({
    type: filterType.value || null,
    status: filterStatus.value || null,
    city: filterCity.value.trim() || null
  });
};

btnReset.onclick = () => {
  filterType.value = "";
  filterStatus.value = "";
  filterCity.value = "";
  loadAll();
};

requireAdmin({
  onOk: () => loadAll(),
  onDenied: () => {
    msg.textContent = "⛔ Accès refusé";
    rows.innerHTML = "";
  }
});
