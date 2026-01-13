import { db, auth } from "/wauklink-site/shared/firebase.js";
import { requireAdmin } from "/wauklink-site/shared/guard.js";
import { logAdminAction } from "/wauklink-site/shared/admin_logger.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const list = document.getElementById("list");
const msg  = document.getElementById("msg");

/* ========= HELPERS ========= */
const esc = s => String(s ?? "").replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));

function badge(u) {
  if (u.role === "admin") return "👑 Administrateur";
  if (u.isBanned) return "🚫 Banni";
  if (u.plan === "pro") return "🟢 Professionnel";
  if (u.plan === "particulier") return "🟡 Particulier";
  return "⚪ Gratuit";
}

/* ========= CHARGEMENT DES UTILISATEURS ========= */
async function loadUsers() {
  list.innerHTML = "";
  msg.textContent = "⏳ Chargement des utilisateurs...";

  try {
    const snap = await getDocs(collection(db, "users"));

    if (snap.empty) {
      msg.textContent = "❌ Aucun utilisateur trouvé";
      return;
    }

    msg.textContent = `${snap.size} utilisateur(s) inscrit(s)`;

    snap.forEach(d => {
      const u   = d.data();
      const uid = d.id;

      const card = document.createElement("div");
      card.className = "card";
      // Si banni, on met un style visuel différent
      if (u.isBanned) {
        card.style.borderLeft = "5px solid #ef4444";
        card.style.opacity = "0.8";
      }

      let controls = `<div class="meta" style="margin-bottom:8px;">${badge(u)}</div>`;

      if (u.role !== "admin") {
        controls += `
          <div style="margin-top:10px;">
            <label class="meta">Changer le Plan :</label>
            <select class="planSelect" style="width:100%">
              <option value="free">Gratuit</option>
              <option value="particulier">Particulier</option>
              <option value="pro">Professionnel</option>
            </select>
          </div>
          <div style="margin-top:12px;">
            <button class="btn ${u.isBanned ? 'btn-ok' : 'btn-danger'} btnBan" style="width:100%; padding:8px;">
              ${u.isBanned ? "✅ Débannir l'utilisateur" : "🚫 Bannir l'utilisateur"}
            </button>
          </div>
        `;
      } else {
        controls += `<p class="meta" style="font-style:italic; margin-top:10px;">Actions impossibles sur un admin</p>`;
      }

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:start;">
           <div>
              <strong style="font-size:1.1em;">${esc(u.firstName || "Sans")} ${esc(u.lastName || "Nom")}</strong>
              <div class="meta">${esc(u.email)}</div>
           </div>
        </div>
        <hr style="margin:12px 0; opacity:0.1; border:none; border-top:1px solid white;">
        <div class="row-actions" style="display:block;">
          ${controls}
        </div>
      `;

      // --- 1. LOGIQUE PLAN ---
      const select = card.querySelector(".planSelect");
      if (select) {
        select.value = u.plan || "free";
        select.onchange = async () => {
          const newPlan = select.value;
          if (!confirm(`Passer ${u.email} au plan ${newPlan} ?`)) {
            select.value = u.plan || "free";
            return;
          }
          try {
            await updateDoc(doc(db, "users", uid), {
              plan: newPlan,
              isPro: newPlan === "pro"
            });
            await logAdminAction({
              action: "user_plan_change",
              adminUid: auth.currentUser?.uid,
              adminEmail: auth.currentUser?.email,
              extra: { targetId: uid, targetEmail: u.email, newPlan }
            });
            alert("✅ Plan mis à jour !");
            loadUsers(); // Rafraîchir pour voir le badge changer
          } catch (err) {
            alert("❌ Erreur : " + err.message);
          }
        };
      }

      // --- 2. LOGIQUE BANNISSEMENT ---
      const btnBan = card.querySelector(".btnBan");
      if (btnBan) {
        btnBan.onclick = async () => {
          const newState = !u.isBanned;
          if (!confirm(`${newState ? "Bannir" : "Débannir"} définitivement ${u.email} ?`)) return;

          try {
            await updateDoc(doc(db, "users", uid), { isBanned: newState });
            await logAdminAction({
              action: newState ? "user_banned" : "user_unbanned",
              adminUid: auth.currentUser?.uid,
              adminEmail: auth.currentUser?.email,
              extra: { targetId: uid, targetEmail: u.email }
            });
            loadUsers(); 
          } catch (err) {
            alert("❌ Erreur : " + err.message);
          }
        };
      }

      list.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    msg.textContent = "❌ Erreur de chargement des données";
  }
}

/* ========= PROTECTION ADMIN ========= */
requireAdmin({
  onOk: loadUsers,
  onDenied: () => {
    msg.innerHTML = "⛔ <strong>Accès refusé</strong><br>Espace réservé à la direction.";
    list.innerHTML = "";
  }
});
