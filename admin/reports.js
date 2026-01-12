/* ===============================
   ADMIN — SIGNALMENTS (REPORTS)
   =============================== */

import { db } from "/wauklink-site/shared/firebase.js";
import { requireModerator } from "/wauklink-site/shared/guard.js";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ========= DOM ========= */
const list = document.getElementById("list");
const msg  = document.getElementById("msg");

/* ========= HELPERS ========= */
const esc = s =>
  String(s ?? "").replace(/[&<>"']/g, m =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",
       '"':"&quot;","'":"&#039;" }[m])
  );

function showEmpty(text) {
  msg.textContent = text;
  list.innerHTML = `<p class="meta">Tout est à jour.</p>`;
}

/* ========= LOAD REPORTS ========= */
async function loadReports() {
  msg.textContent = "⏳ Chargement des signalements…";
  list.innerHTML = "";

  try {
    const q = query(
      collection(db, "reports"),
      where("status", "==", "open"),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      showEmpty("✅ Aucun signalement ouvert.");
      return;
    }

    msg.textContent = `📋 ${snap.size} signalement(s) ouverts`;

    snap.forEach(d => {
      const r = d.data();

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <strong>${esc(r.reason || "Signalement utilisateur")}</strong>

        <div class="meta">
          Annonce :
          <a class="link"
             href="/wauklink-site/admin/annonce.html?id=${esc(r.annonceId)}"
             target="_blank">
            ${esc(r.annonceId)}
          </a>
        </div>

        <div class="meta">
          Signalé par : ${esc(r.reporterEmail || "inconnu")}
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
          console.error("report update error:", err);
          btn.disabled = false;
          btn.textContent = "Marquer comme traité";
          alert("❌ Erreur lors du traitement");
        }
      };

      list.appendChild(card);
    });

  } catch (err) {
    console.error("loadReports error:", err);
    msg.textContent = "❌ Erreur de chargement des signalements";
    list.innerHTML = "";
  }
}

/* ========= GUARD ========= */
requireModerator({
  onOk: loadReports,
  onDenied: () => {
    msg.textContent = "⛔ Accès réservé à la modération";
    list.innerHTML = "";
  }
});
