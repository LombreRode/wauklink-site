/* ===============================
   ADMIN — ANNONCES (FINAL SAFE)
   =============================== */

import { db, auth } from "../shared/firebase.js";
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

/* ========= DOM ========= */
const rows = document.getElementById("rows");
const msg  = document.getElementById("msg");

const filterType   = document.getElementById("filterType");
const filterStatus = document.getElementById("filterStatus");
const filterCity   = document.getElementById("filterCity");
const filterSearch = document.getElementById("filterSearch");

const btnFilter = document.getElementById("btnFilter");
const btnReset  = document.getElementById("btnReset");
const btnPrev   = document.getElementById("btnPrev");
const btnNext   = document.getElementById("btnNext");
const pageInfo  = document.getElementById("pageInfo");

/* ========= STATE ========= */
const PAGE_SIZE = 10;
let lastDoc = null;
let currentPage = 1;
let currentFilters = {};
let currentSearch = "";

/* ========= HELPERS ========= */
const esc = s =>
  String(s ?? "").replace(/[&<>"']/g, m =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m])
  );

function badge(status) {
  if (status === "active")   return "🟢 active";
  if (status === "disabled") return "🟠 désactivée";
  return "🟡 en attente";
}

/* ========= LOG ADMIN (COMPLET) ========= */
async function logAdmin(action, annonceId, extra = {}) {
  try {
    const user = auth.currentUser;
    await addDoc(collection(db, "admin_logs"), {
      action,
      annonceId,
      adminUid: user?.uid || null,
      adminEmail: user?.email || null,
      extra,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.error("logAdmin error", e);
  }
}

/* ========= QUERY BUILDER ========= */
function buildQuery({ after = null } = {}) {
  const c = [];

  if (currentFilters.type)
    c.push(where("type", "==", currentFilters.type));
  if (currentFilters.status)
    c.push(where("status", "==", currentFilters.status));
  if (currentFilters.city)
    c.push(where("city", "==", currentFilters.city));

  c.push(orderBy("createdAt", "desc"), limit(PAGE_SIZE));

  if (after) c.push(startAfter(after));

  return query(collection(db, "annonces"), ...c);
}

/* ========= LOAD PAGE ========= */
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

      /* 🔍 Recherche titre */
      if (currentSearch) {
        const t = (a.title || "").toLowerCase();
        if (!t.includes(currentSearch)) return;
      }

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
        if (!confirm(`Désactiver : ${a.title} (${a.city}) ?`)) return;
        await updateDoc(doc(db, "annonces", d.id), { status: "disabled" });
        await logAdmin("disable", d.id, { title: a.title });
        tr.children[4].textContent = badge("disabled");
      };

      btnActivate.onclick = async () => {
        if (!confirm(`Activer : ${a.title} (${a.city}) ?`)) return;
        await updateDoc(doc(db, "annonces", d.id), { status: "active" });
        await logAdmin("activate", d.id, { title: a.title });
        tr.children[4].textContent = badge("active");
      };

      btnDelete.onclick = async () => {
        const ok = confirm(
          `⚠️ SUPPRESSION DÉFINITIVE\n\nTitre : ${a.title}\nVille : ${a.city}\n\nConfirmer ?`
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

/* ========= ACTIONS ========= */
btnFilter.onclick = () => {
  currentFilters = {
    type: filterType.value || null,
    status: filterStatus.value || null,
    city: filterCity.value.trim() || null
  };
  currentSearch = (filterSearch?.value || "").toLowerCase().trim();
  btnPrev.disabled = true;
  btnNext.disabled = false;
  loadPage({ reset: true });
};

btnReset.onclick = () => {
  filterType.value = "";
  filterStatus.value = "";
  filterCity.value = "";
  if (filterSearch) filterSearch.value = "";
  currentFilters = {};
  currentSearch = "";
  btnPrev.disabled = true;
  btnNext.disabled = false;
  loadPage({ reset: true });
};

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

/* ========= GUARD ========= */
requireAdmin({
  onOk: () => loadPage({ reset: true }),
  onDenied: () => {
    msg.textContent = "⛔ Accès refusé";
    rows.innerHTML = "";
  }
});
