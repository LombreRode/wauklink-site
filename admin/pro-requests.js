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
    // On crée un ID unique pour la notification
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
          // 1. Update utilisateur
          await updateDoc(doc(db, "users", req.userId), {
            isPro: true,
            plan: "pro",
            "pro.validated": true,
            "pro.validatedAt": serverTimestamp()
          });

          // 2. Envoyer notification à l'utilisateur
          await sendNotification(
            req.userId, 
            "Félicitations ! 🚀", 
            `Votre demande pour ${req.businessName} a été validée. Vous êtes désormais membre PRO !`,
            "success"
          );

          // 3. Logger l'action admin
          await logAdminAction({
            action: "pro_validate",
            adminUid: auth.currentUser?.uid,
            adminEmail: auth.currentUser?.email,
            extra: { targetEmail: u.email, userId: req.userId }
          });

          // 4. Nettoyer la demande
          await deleteDoc(doc(db, "pro_requests", rid));
          loadRequests(); 
          
        } catch (err) {
          alert("Erreur lors de la validation : " + err.message);
          btnOk.disabled = btnNo.disabled = false;
        }
      };

      // ❌ ACTIONS : REFUSER
      btnNo.onclick = async () => {
        const raison = prompt("Raison du refus (optionnel) :");
        if (raison === null) { // Si on clique sur "Annuler"
          return; 
        }
        
        btnOk.disabled = btnNo.disabled = true;

        try {
          // 1. Update utilisateur (on reset sa demande)
          await updateDoc(doc(db, "users", req.userId), {
            "pro.requested": false
          });

          // 2. Notification de refus
          await sendNotification(
            req.userId, 
            "Demande PRO refusée ❌", 
            `Votre demande a été refusée. Motif : ${raison || "Dossier incomplet"}.`,
            "danger"
          );

          // 3. Logger l'action
          await logAdminAction({
            action: "pro_refuse",
            adminUid: auth.currentUser?.uid,
            adminEmail: auth.currentUser?.email,
            extra: { targetEmail: u.email, userId: req.userId, raison }
          });

          // 4. Supprimer la demande
          await deleteDoc(doc(db, "pro_requests", rid));
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
