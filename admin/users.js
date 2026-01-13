<script type="module">
import { db, auth } from "/wauklink-site/shared/firebase.js";
import { requireAdmin } from "/wauklink-site/shared/guard.js";
import { logAdminAction } from "/wauklink-site/shared/admin_logger.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc // Ajouté pour le bannissement si besoin
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const list = document.getElementById("list");
const msg  = document.getElementById("msg");

/* ========= HELPERS ========= */
const esc = s => String(s ?? "").replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));

function badge(u) {
  if (u.role === "admin") return "👑 Administrateur";
  if (u.isBanned) return "🚫 Banni"; // Nouvelle condition
  if (u.plan === "pro") return "🟢 Professionnel";
  if (u.plan === "particulier") return "🟡 Particulier";
  return "⚪ Gratuit";
}

/* ========= CHARGEMENT ========= */
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
      // Si l'utilisateur est banni, on grise la carte
      if (u.isBanned) card.style.opacity = "0.6";

      let controls = `<div class="meta">${badge(u)}</div>`;

      if (u.role !== "admin") {
        controls += `
          <div style="margin-top:10px;">
            <label class="meta">Plan :</label>
            <select class="planSelect input" style="width:100%">
              <option value="free">Gratuit</option>
              <option value="particulier">Particulier</option>
              <option value="pro">Professionnel</option>
            </select>
          </div>
          <div style="margin-top:10px;">
            <button class="btn btn-danger btnBan" style="width:100%; padding:5px;">
              ${u.isBanned ? "✅ Débannir" : "🚫 Bannir"}
            </button>
          </div>
        `;
      }

      card.innerHTML = `
        <strong>${esc(u.firstName)} ${esc(u.lastName)}</strong>
        <div class="meta">${esc(u.email)}</div>
        <div class="row-actions">
          ${controls}
        </div>
      `;

      // --- LOGIQUE CHANGEMENT DE PLAN ---
      const select = card.querySelector(".planSelect");
      if (select) {
        select.value = u.plan || "free";
        select.onchange = async () => {
          const newPlan = select.value;
          if (!confirm(`Changer le plan en "${newPlan}" ?`)) {
            select.value = u.plan || "free";
            return;
          }
          try {
            await updateDoc(doc(db, "users", uid), {
              plan: newPlan,
              isPro: newPlan === "pro"
            });
            alert("✅ Plan mis à jour");
          } catch (err) {
            alert("❌ Erreur");
          }
        };
      }

      // --- LOGIQUE BANNISSEMENT ---
      const btnBan = card.querySelector(".btnBan");
      if (btnBan) {
        btnBan.onclick = async () => {
          const newState = !u.isBanned;
          if (!confirm(`${newState ? "Bannir" : "Débannir"} cet utilisateur ?`)) return;

          try {
            await updateDoc(doc(db, "users", uid), { isBanned: newState });
            
            // Log de l'action corrigé
            await logAdminAction({
              action: newState ? "user_banned" : "user_unbanned",
              adminUid: auth.currentUser?.uid, // Indispensable pour ton logger !
              adminEmail: auth.currentUser?.email,
              extra: { targetId: uid }
            });

            loadUsers(); // Recharge la liste
          } catch (err) {
            alert("❌ Erreur lors de l'action");
          }
        };
      }

      list.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    msg.textContent = "❌ Erreur critique de chargement";
  }
}

/* ========= PROTECTION ========= */
requireAdmin({
  onOk: loadUsers,
  onDenied: () => {
    msg.innerHTML = "⛔ <strong>Accès refusé</strong><br>Vous n'êtes pas Administrateur.";
    list.innerHTML = "";
  }
});
</script>
