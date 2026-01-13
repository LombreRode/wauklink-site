// admin/reports.js
import { db, auth } from "/wauklink-site/shared/firebase.js";
import { requireModerator } from "/wauklink-site/shared/guard.js";
import { logAdminAction } from "/wauklink-site/shared/admin_logger.js";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ========= DOM ========= */
const list = document.getElementById("list");
const msg  = document.getElementById("msg");

/* ========= HELPERS (Sécurité & UI) ========= */
// Empêche l'injection de code malveillant dans le HTML
const esc = s =>
  String(s ?? "").replace(/[&<>"']/g, m =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m])
  );

function showEmpty(text) {
  msg.textContent = text;
  list.innerHTML = `
    <div class="card" style="text-align:center; grid-column: 1 / -1; padding: 2rem;">
      <p class="meta">Aucun signalement en attente. Beau travail !</p>
    </div>`;
}

/* ========= CHARGEMENT DES DONNÉES ========= */
async function loadReports() {
  msg.textContent = "⏳ Chargement des signalements…";
  list.innerHTML = "";

  try {
    // ⚠️ Cette requête nécessite un index Firestore. 
    // Si elle échoue, vérifie le lien dans la console F12.
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

    msg.textContent = `📋 ${snap.size} signalement(s) à traiter`;

    snap.forEach(d => {
      const r = d.data();
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <div style="margin-bottom: 10px;">
            <span class="badge badge-warning">Signalement</span>
        </div>
        <strong style="font-size: 1.1rem; display: block; margin-bottom: 10px;">
            ${esc(r.reason || "Motif non précisé")}
        </strong>
        
        <div class="meta" style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px; margin-bottom: 15px;">
          <div style="margin-bottom: 5px;">
            <strong>Annonce :</strong> 
            <a class="link" href="/wauklink-site/admin/annonce.html?id=${esc(r.annonceId)}" target="_blank">
              ${esc(r.annonceId)} ↗
            </a>
          </div>
          <div>
            <strong>Par :</strong> ${esc(r.reporterEmail || "Anonyme")}
          </div>
        </div>

        <div class="row-actions">
          <button class="btn btn-ok" id="btn-close-${d.id}" style="width: 100%;">
            Marquer comme traité
          </button>
        </div>
      `;

      const btn = card.querySelector(`#btn-close-${d.id}`);

      btn.onclick = async () => {
        if (!confirm("Voulez-vous clôturer ce signalement ?")) return;
        
        btn.disabled = true;
        btn.textContent = "Clôture en cours…";

        try {
          // 1. Mise à jour dans Firestore
          await updateDoc(doc(db, "reports", d.id), {
            status: "closed",
            closedAt: serverTimestamp(),
            closedBy: auth.currentUser?.email
          });

          // 2. Enregistrement dans les logs admin
          await logAdminAction({
            action: "report_closed",
            adminUid: auth.currentUser?.uid,
            adminEmail: auth.currentUser?.email,
            annonceId: r.annonceId,
            extra: { reason: r.reason, reportId: d.id }
          });

          // 3. UI Update
          card.style.transform = "scale(0.95)";
          card.style.opacity = "0";
          
          setTimeout(() => {
            card.remove();
            if (!list.children.length) {
              showEmpty("✅ Tous les signalements ont été traités.");
            } else {
              msg.textContent = `📋 ${list.children.length} signalement(s) restants`;
            }
          }, 300);

        } catch (err) {
          console.error("Erreur clôture signalement:", err);
          btn.disabled = false;
          btn.textContent = "Marquer comme traité";
          alert("❌ Erreur : permissions insuffisantes ou problème réseau.");
        }
      };

      list.appendChild(card);
    });

  } catch (err) {
    console.error("loadReports error:", err);
    msg.textContent = "❌ Problème de chargement.";
    
    // Message spécifique pour l'index manquant
    if (err.message.includes("index")) {
        list.innerHTML = `
        <div class="card" style="border: 1px solid #ff4444; grid-column: 1/-1;">
            <p style="color: #ff4444; font-weight: bold;">Index Firestore manquant</p>
            <p class="meta">Ouvre la console (F12) et clique sur le lien généré par Firebase pour activer cette vue.</p>
        </div>`;
    }
  }
}

/* ========= SÉCURITÉ (GUARD) ========= */
requireModerator({
  onOk: loadReports,
  onDenied: () => {
    msg.textContent = "⛔ Accès refusé : Droits modérateur requis.";
    list.innerHTML = "";
    // Optionnel : redirection automatique
    // setTimeout(() => window.location.href = "/wauklink-site/", 2000);
  }
});
