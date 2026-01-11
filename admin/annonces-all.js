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
  addDoc,
  serverTimestamp,
  limit,
  startAfter
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ================== DOM ================== */
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

/* ================== STATE ================== */
const PAGE_SIZE = 10;
let lastDoc = null;
let currentPage = 1;
let currentFilters = {};

/* ================== HELPERS ================== */
const esc = s =>
  String(s ?? "").replace(/[&<>"']/g, m =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m])
  );

function badge(status) {
  if (status === "active") return "🟢 active";
  if (status === "disabled") return "🟠 désactivée";
  return "🟡 en attente";
}

async function logAdmin(action, annonceId, extra = {}) {
  try {
    await addDoc(collection(db, "admin_logs"), {
      action,
      annonceId,
      extra,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.warn("log admin error:", e);
  }
}

/* ================== QUERY BUILDER ================== */
function buildQuery({ after = null } = {}) {
  const constraints = [];

  if (currentFilters.type) {
    constraints.push(where("type", "==", currentFilters.type));
  }
  if (currentFilters.status) {
    constraints.push(where("status", "==", currentFilters.status));
  }
  if (currentFilters.city) {
    constraints.push(where("city", "==", currentFilters.city));
  }

  constraints.push(orderBy("createdAt", "desc"));
  constraints.push(limit(PAGE_SIZE));

  if (after) constraints.push(startAfter(after));

  return query(collection(db, "annonces"), ...constraints);
}

/* ================== LOAD PAGE ================== */
async function loadPage({ reset = false } = {}) {
  if (reset) {
    lastDoc = null;
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

    lastDoc = res.docs[res.docs.length - 1];
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
        if (!confirm(`Désactiver l’annonce :\n${a.title} (${a.city}) ?`)) return;
        await updateDoc(doc(db, "annonces", d.id), { status: "disabled" });
        await logAdmin("disable", d.id);
        tr.children[4].textContent = badge("disabled");
      };

      btnActivate.onclick = async () => {
        if (!confirm(`Activer l’annonce :\n${a.title} (${a.city}) ?`)) return;
        await updateDoc(doc(db, "annonces", d.id), { status: "active" });
        await logAdmin("activate", d.id);
        tr.children[4].textContent = badge("active");
      };

      btnDelete.onclick = async () => {
        const ok = confirm(
          `⚠️ SUPPRESSION DÉFINITIVE ⚠️\n\n` +
          `Titre : ${a.title}\nVille : ${a.city}\n\n` +
          `Cette action est irréversible.\n\nConfirmer ?`
        );
        if (!ok) return;

        await deleteDoc(doc(db, "annonces", d.id));
        await logAdmin("delete", d.id, { title: a.title, city: a.city });
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

/* ================== FILTERS ================== */
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

/* ================== PAGINATION ================== */
btnNext.onclick = () => {
  currentPage++;
  btnPrev.disabled = false;
  loadPage();
};

btnPrev.onclick = async () => {
  currentPage = Math.max(1, currentPage - 1);
  btnPrev.disabled = currentPage === 1;
  lastDoc = null;
  await loadPage({ reset: true });
};

/* ================== GUARD ================== */
requireAdmin({
  onOk: () => loadPage({ reset: true }),
  onDenied: () => {
    msg.textContent = "⛔ Accès refusé";
    rows.innerHTML = "";
  }
});
