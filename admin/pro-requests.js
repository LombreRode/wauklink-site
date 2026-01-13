import { db, auth } from "/wauklink-site/shared/firebase.js";
import { requireAdmin } from "/wauklink-site/shared/guard.js";
import { logAdminAction } from "/wauklink-site/shared/admin_logger.js";
import {
  collection, query, where,
  getDocs, getDoc,
  doc, updateDoc, deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const list = document.getElementById("list");
const msg  = document.getElementById("msg");

/* ========= HELPERS ========= */
const esc = s => String(s ?? "").replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));

/* ========= LOAD PRO REQUESTS ========= */
async function loadRequests() {
  list.innerHTML = "";
  msg.textContent = "⏳ Chargement des demandes PRO…";

  try {
    const q = query(
      collection(db, "pro_requests"),
      where("status", "==", "pending")
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      msg.textContent = "✅ Aucune demande PRO en attente.";
      return;
    }

    msg.textContent = `📋 ${snap.size} demande(s) PRO à traiter`;

    for (const d of snap.docs) {
      const req = d.data();
      const userSnap = await getDoc(doc(db, "users", req.userId));
      
      if (!userSnap.exists()) continue;
      const u = userSnap.data();

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <div style="margin-bottom: 12px;">
          <strong style="font-size:1.1em; color:var(--brand);">${esc(req.businessName || u.firstName + " " + u.lastName)}</strong>
          <div class="meta" style="margin-top:5px;">
            📧 ${esc(u.email)}<br>
            📞 ${esc(u.phone || "Non renseigné")}<br>
            🆔 SIRET : <code>${esc(req.siret || "Non fourni")}</code>
          </div>
        </div>
        
        <div class="row-actions" style="display:flex; gap:10px; margin-top:auto;">
          <button class="btn btn-ok btnApprove" style="flex:1">Valider</button>
          <button class="btn btn-danger btnReject" style="flex:1">Refuser</button>
        </div>
      `;

      const btnOk = card.querySelector(".btnApprove");
      const btnNo = card.querySelector(".btnReject");

      // ✅ ACTIONS : VALIDER
      btnOk.onclick = async () => {
        if (!confirm(`Valider le compte PRO de ${req.businessName || u.email} ?`)) return;
        btnOk.disabled = btnNo.disabled = true;

        try {
          await updateDoc(doc(db, "users", req.userId), {
            isPro: true,
            plan: "pro",
            "pro.validated": true,
            "pro.validatedAt": serverTimestamp()
          });

          await logAdminAction({
            action: "pro_validate",
            adminUid: auth.currentUser?.uid,
            adminEmail: auth.currentUser?.email,
            extra: { targetEmail: u.email, userId: req.userId }
          });

          await deleteDoc(doc(db, "pro_requests", d.id));
          loadRequests(); // Rafraîchir la liste
        } catch (err) {
          alert("Erreur lors de la validation : " + err.message);
          btnOk.disabled = btnNo.disabled = false;
        }
      };

      // ❌ ACTIONS : REFUSER
      btnNo.onclick = async () => {
        if (!confirm("Refuser cette demande PRO ?")) return;
        btnOk.disabled = btnNo.disabled = true;

        try {
          await updateDoc(doc(db, "users", req.userId), {
            "pro.requested": false
          });

          await logAdminAction({
            action: "pro_refuse",
            adminUid: auth.currentUser?.uid,
            adminEmail: auth.currentUser?.email,
            extra: { targetEmail: u.email, userId: req.userId }
          });

          await deleteDoc(doc(db, "pro_requests", d.id));
          loadRequests();
        } catch (err) {
          alert("Erreur lors du refus : " + err.message);
          btnOk.disabled = btnNo.disabled = false;
        }
      };

      list.appendChild(card);
    }
  } catch (err) {
    console.error(err);
    msg.textContent = "❌ Erreur Firestore ou accès refusé";
  }
}

/* ========= GUARD ADMIN ========= */
requireAdmin({
  onOk: loadRequests,
  onDenied: () => {
    msg.textContent = "⛔ Accès réservé aux administrateurs";
    list.innerHTML = "";
  }
});
