import { db } from "../shared/firebase.js";
import { requireModerator } from "../shared/guard.js";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const list  = document.getElementById("list");
const empty = document.getElementById("empty");

const esc = s =>
  String(s ?? "").replace(/[&<>"']/g, m =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m])
  );

function showEmpty(text) {
  empty.textContent = text;
  empty.classList.remove("hidden");
  list.innerHTML = "";
}

async function loadReports() {
  list.innerHTML = "";
  empty.classList.add("hidden");

  const q = query(
    collection(db, "reports"),
    where("status", "==", "open"), // ✅ uniquement ouverts
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    showEmpty("✅ Aucun signalement en attente.");
    return;
  }

  snap.forEach(d => {
    const r = d.data();

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div><strong>Annonce :</strong></div>
      <div class="meta">
        <a class="link"
           href="/wauklink-site/admin/annonce.html?id=${esc(r.annonceId)}"
           target="_blank">
          ${esc(r.annonceId)}
        </a>
      </div>

      <div><strong>Motif :</strong></div>
      <div class="meta">${esc(r.reason || "—")}</div>

      <div class="meta">
        Signalé par ${esc(r.reporterEmail || "inconnu")}
      </div>

      <div class="row-actions" style="margin-top:12px">
        <button class="btn btn-ok">
          Marquer comme traité
        </button>
      </div>
    `;

    const btn = card.querySelector("button");

    btn.onclick = async () => {
      if (!confirm("Marquer ce signalement comme traité ?")) return;

      btn.disabled = true;
      btn.textContent = "Traitement…";

      try {
        await updateDoc(
          doc(db, "reports", d.id),
          { status: "closed" }
        );

        card.remove();

        if (!list.children.length) {
          showEmpty("✅ Tous les signalements ont été traités.");
        }
      } catch (err) {
        console.error(err);
        btn.disabled = false;
        btn.textContent = "Marquer comme traité";
        alert("❌ Erreur lors du traitement");
      }
    };

    list.appendChild(card);
  });
}

// 🔒 MODÉRATEUR / ADMIN UNIQUEMENT
requireModerator({
  redirectTo: "../auth/login.html",
  onOk: loadReports
});
