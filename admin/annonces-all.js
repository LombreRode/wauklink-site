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
  deleteDoc,
  limit,
  startAfter
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const rows = document.getElementById("rows");
const msg  = document.getElementById("msg");

const filterType   = document.getElementById("filterType");
const filterStatus = document.getElementById("filterStatus");
const filterCity   = document.getElementById("filterCity");
const btnFilter    = document.getElementById("btnFilter");
const btnReset     = document.getElementById("btnReset");

const btnPrev  = document.getElementById("btnPrev");
const btnNext  = document.getElementById("btnNext");
const pageInfo = document.getElementById("pageInfo");

const PAGE_SIZE = 10;
let lastDoc = null;
let firstDoc = null;
let currentPage = 1;
let currentFilters = {};

const esc = s =>
  String(s ?? "").replace(/[&<>"']/g, m =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m])
  );

function badge(status) {
  if (status === "active") return "🟢 active";
  if (status === "disabled") return "🟠 désactivée";
  return "🟡 en attente";
}

function buildQuery({ after = null } = {}) {
  const constraints = [orderBy("createdAt", "desc"), limit(PAGE_SIZE)];

  if (currentFilters.type) {
    constraints.unshift(where("type", "==", currentFilters.type));
  }
  if (currentFilters.status) {
    constraints.unshift(where("status", "==", currentFilters.status));
  }
  if (currentFilters.city) {
    constraints.unshift(where("city", "==", currentFilters.city));
  }
  if (after) {
    constraints.push(startAfter(after));
  }

  return query(collection(db, "annonces"), ...constraints);
}

async function loadPage({ reset = false } = {}) {
  if (reset) {
    lastDoc = null;
    firstDoc = null;
    currentPage = 1;
    btnPrev.disabled = true;
  }

  rows.innerHTML = "";
  msg.textContent = "Chargement…";

  try {
    const q = buildQuery({ after: lastDoc });
    const res = await getDocs(q);

    if (res.empty) {
      rows.innerHTML =
        `<tr><td colspan="6" class="meta">Aucune annonce</td></tr>`;
      msg.textContent = "";
      btnNext.disabled = true;
      return;
    }

    firstDoc = res.docs[0];
    lastDoc  = res.docs[res.docs.length - 1];

    pageInfo.textContent = `Page ${currentPage}`;
    btnNext.disabled = res.docs.length < PAGE_SIZE;

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

// 🔘 Actions filtres
btnFilter.onclick = () => {
  currentFilters = {
    type: filterType.value || null,
    status: filterStatus.value || null,
    city: filterCity.value.trim() || null
  };
  btnPrev.disabled = true;
  btnNext.disabled = false;
  loadPage({ reset: true });
};

btnReset.onclick = () => {
  filterType.value = "";
  filterStatus.value = "";
  filterCity.value = "";
  currentFilters = {};
  btnPrev.disabled = true;
  btnNext.disabled = false;
  loadPage({ reset: true });
};

// 🔁 Pagination
btnNext.onclick = () => {
  currentPage++;
  btnPrev.disabled = false;
  loadPage();
};

btnPrev.onclick = async () => {
  // Pour rester simple et fiable avec Firestore,
  // on repart de zéro jusqu’à la page précédente
  currentPage = Math.max(1, currentPage - 1);
  btnPrev.disabled = currentPage === 1;
  lastDoc = null;
  await loadPage({ reset: true });
};

requireAdmin({
  onOk: () => loadPage({ reset: true }),
  onDenied: () => {
    msg.textContent = "⛔ Accès refusé";
    rows.innerHTML = "";
  }
});
