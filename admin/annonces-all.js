// admin/annonces-all.js
import { db, auth } from "/wauklink-site/shared/firebase.js";
import { requireAdmin } from "/wauklink-site/shared/guard.js";
import { logAdminAction } from "/wauklink-site/shared/admin_logger.js";
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
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",
       '"':"&quot;","'":"&#039;" }[m])
  );

const badge = s =>
  s === "active" ? "🟢 active" :
  s === "disabled" ? "🟠 désactivée" :
  "🟡 en attente";

/* ========= QUERY ========= */
function buildQuery({ after = null } = {}) {
  const q = [];
  if (currentFilters.type)
    q.push(where("type", "==", currentFilters.type));
  if (currentFilters.status)
    q.push(where("status", "==", currentFilters.status));
  if (currentFilters.city)
    q.push(where("city", "==", currentFilters.city));

  q.push(orderBy("createdAt", "desc"));
  q.push(limit(PAGE_SIZE));
  if (after) q.push(startAfter(after));

  return query(collection(db, "annonces"), ...q);
}

/* ========= LOAD ========= */
async function loadPage({ reset = false } = {}) {
  if (reset) {
    lastDoc = null;
    currentPage = 1;
    btnPrev.disabled = true;
  }

  rows.innerHTML = "";
  msg.textContent = "Chargement…";

  try {
    const snap = await getDocs(buildQuery({ after: lastDoc }));

    if (snap.empty) {
      rows.innerHTML =
        `<tr><td colspan="6" class="meta">Aucune annonce</td></tr>`;
      msg.textContent = "";
      btnNext.disabled = true;
      return;
    }

    lastDoc = snap.docs[snap.docs.length - 1];
    pageInfo.textContent = `Page ${currentPage}`;
    btnNext.disabled = snap.docs.length < PAGE_SIZE;
    msg.textContent = `${snap.size} annonce(s)`;

    snap.forEach(d => {
      const a = d.data();

      if (currentSearch) {
        const t = (a.title || "").toLowerCase();
        if (!t.includes(currentSearch)) return;
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${esc(a.title || "—")}</td>
        <td>${esc(a.city || "—")}</td>
        <td>${esc(a.type || "—")}</td>
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

      const lock = v => {
        btnDisable.disabled = v;
        btnActivate.disabled = v;
        btnDelete.disabled = v;
      };

      btnDisable.onclick = async () => {
        if (!confirm(`Désactiver : ${a.title} (${a.city}) ?`)) return;
        lock(true);
        await updateDoc(doc(db, "annonces", d.id), { status: "disabled" });
        await logAdminAction({
          action: "disable",
          adminUid: auth.currentUser?.uid,
          adminEmail: auth.currentUser?.email,
          annonceId: d.id
        });
        tr.children[4].textContent = badge("disabled");
        lock(false);
      };

      btnActivate.onclick = async () => {
        if (!confirm(`Activer : ${a.title} (${a.city}) ?`)) return;
        lock(true);
        await updateDoc(doc(db, "annonces", d.id), { status: "active" });
        await logAdminAction({
          action: "activate",
          adminUid: auth.currentUser?.uid,
          adminEmail: auth.currentUser?.email,
          annonceId: d.id
        });
        tr.children[4].textContent = badge("active");
        lock(false);
      };

      btnDelete.onclick = async () => {
        if (!confirm("⚠️ SUPPRESSION DÉFINITIVE\n\nConfirmer ?")) return;
        lock(true);
        await deleteDoc(doc(db, "annonces", d.id));
        await logAdminAction({
          action: "delete",
          adminUid: auth.currentUser?.uid,
          adminEmail: auth.currentUser?.email,
          annonceId: d.id
        });
        tr.remove();
      };

      rows.appendChild(tr);
    });
  } catch (e) {
    console.error("annonces-all error:", e);
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
  loadPage({ reset: true });
};

btnReset.onclick = () => {
  filterType.value = "";
  filterStatus.value = "";
  filterCity.value = "";
  if (filterSearch) filterSearch.value = "";
  currentFilters = {};
  currentSearch = "";
  loadPage({ reset: true });
};

btnNext.onclick = () => {
  currentPage++;
  btnPrev.disabled = false;
  loadPage();
};

btnPrev.onclick = () => {
  currentPage = Math.max(1, currentPage - 1);
  btnPrev.disabled = currentPage === 1;
  loadPage({ reset: true });
};

/* ========= GUARD ========= */
requireAdmin({
  onOk: () => loadPage({ reset: true }),
  onDenied: () => {
    msg.textContent = "⛔ Accès refusé";
    rows.innerHTML = "";
  }
});
