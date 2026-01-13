import { db, auth } from "/wauklink-site/shared/firebase.js";
import { requireAdmin } from "/wauklink-site/shared/guard.js";
import { logAdminAction } from "/wauklink-site/shared/admin_logger.js";
import {
  collection, query, where,
  getDocs, getDoc, setDoc,
  doc, updateDoc, deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const list = document.getElementById("list");
const msg  = document.getElementById("msg");

/* ========= HELPERS ========= */
const esc = s => String(s ?? "").replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));

/* ========= FONCTION NOTIFICATION ========= */
async function sendNotification(userId, title, message, type = "info") {
  try {
    const notifRef = doc(collection(db, "notifications"));
    await setDoc(notifRef, {
      userId: userId,
      title: title,
      message: message,
      type: type,
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.error("Erreur notification:", err);
  }
}

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
      const rid = d.id;
      const userSnap = await getDoc(doc(db, "users", req.userId));
      
      if (!userSnap.exists()) continue;
      const u = userSnap.data();

      const card = document.createElement("div");
      card.className = "card mb"; // Ajout de marge en bas

      card.innerHTML = `
        <div style="margin-bottom: 12px;">
          <strong style="font-size:1.1em; color:var(--brand);">${esc(req.businessName || u.firstName)}</strong>
          <div class="meta" style="margin-top:5px; line-height: 1.6;">
            📧 ${esc(u.email)}<br>
            📞 ${esc(u.phone || "Non renseigné")}<br>
            🆔 SIRET : <code>${esc(req.siret || "Non fourni")}</code>
          </div>
          
          <div style="margin-top:12px; padding:10px; background:rgba(255,255,255,0.05); border-radius:8px; border: 1px solid rgba(34, 197, 94, 0.3);">
            <a href="${req.documentUrl}" target="_blank" style="color:var(--brand); text-decoration:none; font-weight:bold; display:flex; align-items:center; gap:8px;">
               📄 Voir le justificatif officiel (Kbis/Carte Pro)
            </a>
          </div>
        </div>
        
        <div class="row-actions" style="display:flex; gap:10px; margin-top:15px;">
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
          // 1. Update utilisateur
          await updateDoc(doc(db, "users", req.userId), {
            plan: "pro",
            "pro.validated": true,
            "pro.validatedAt": serverTimestamp()
          });

          // 2. Notification de succès
          await sendNotification(
            req.userId, 
            "Félicitations ! 🚀", 
            `Votre demande pour ${req.businessName} a été validée. Votre badge PRO est activé !`,
            "success"
          );

          // 3. Log Admin
          await logAdminAction({
            action: "pro_validate",
            adminUid: auth.currentUser?.uid,
            adminEmail: auth.currentUser?.email,
            extra: { targetEmail: u.email, userId: req.userId }
          });

          // 4. Suppression demande
          await deleteDoc(doc(db, "pro_requests", rid));
          loadRequests(); 
          
        } catch (err) {
          alert("Erreur validation : " + err.message);
          btnOk.disabled = btnNo.disabled = false;
        }
      };

      // ❌ ACTIONS : REFUSER
      btnNo.onclick = async () => {
        const raison = prompt("Raison du refus (sera visible par l'utilisateur) :");
        if (raison === null) return; 
        
        btnOk.disabled = btnNo.disabled = true;

        try {
          // 1. Notification de refus
          await sendNotification(
            req.userId, 
            "Dossier PRO refusé ❌", 
            `Votre demande a été refusée. Motif : ${raison || "Document non conforme"}.`,
            "danger"
          );

          // 2. Log Admin
          await logAdminAction({
            action: "pro_refuse",
            adminUid: auth.currentUser?.uid,
            adminEmail: auth.currentUser?.email,
            extra: { targetEmail: u.email, userId: req.userId, raison }
          });

          // 3. Suppression demande
          await deleteDoc(doc(db, "pro_requests", rid));
          loadRequests();
        } catch (err) {
          alert("Erreur refus : " + err.message);
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
