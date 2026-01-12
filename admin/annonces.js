import { db, auth } from "../shared/firebase.js";
import { requireAdmin } from "../shared/guard.js";
import { logAdminAction } from "../shared/admin_logger.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const rows = document.getElementById("rows");
const msg  = document.getElementById("msg");

const esc = s =>
  String(s ?? "").replace(/[&<>"']/g, m =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m])
  );

async function loadAnnonces() {
  rows.innerHTML = "";
  msg.textContent = "Chargement…";

  try {
    const q = query(
      collection(db, "annonces"),
      where("status", "==", "pending")
    );
    const res = await getDocs(q);

    if (res.empty) {
      rows.innerHTML =
        `<tr><td colspan="7" class="meta">Aucune annonce en attente</td></tr>`;
      msg.textContent = "";
      return;
    }

    msg.textContent = `${res.size} annonce(s) en attente`;

    res.forEach(d => {
      const a = d.data();
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${esc(a.title)}</td>
        <td>${esc(a.city)}</td>
        <td>${esc(a.type)}</td>
        <td>${a.price ?? "-"}</td>
        <td class="meta">${esc(a.userId ?? "—")}</td>
        <td>${esc(a.status)}</td>
        <td>
          <a class="btn btn-outline"
             href="/wauklink-site/admin/annonce.html?id=${d.id}">
            Voir
          </a>
          <button class="btn btn-ok">Valider</button>
          <button class="btn btn-warning">Désactiver</button>
        </td>
      `;

      const [btnOk, btnDisable] = tr.querySelectorAll("button");

      // ✅ VALIDER
      btnOk.onclick = async () => {
        if (!confirm("Valider cette annonce ?")) return;

        await updateDoc(doc(db, "annonces", d.id), {
          status: "active"
        });

        await logAdminAction({
          action: "activate",
          adminUid: auth.currentUser.uid,
          adminEmail: auth.currentUser.email,
          annonceId: d.id,
          extra: {
            title: a.title,
            city: a.city
          }
        });

        tr.remove();
      };

      // 🚫 DÉSACTIVER
      btnDisable.onclick = async () => {
        if (!confirm("Désactiver cette annonce ?")) return;

        await updateDoc(doc(db, "annonces", d.id), {
          status: "disabled"
        });

        await logAdminAction({
          action: "disable",
          adminUid: auth.currentUser.uid,
          adminEmail: auth.currentUser.email,
          annonceId: d.id,
          extra: {
            title: a.title,
            city: a.city
          }
        });

        tr.remove();
      };

      rows.appendChild(tr);
    });

  } catch (err) {
    console.error("admin annonces error:", err);
    msg.textContent = "❌ Erreur de chargement des annonces";
    rows.innerHTML = "";
  }
}

requireAdmin({
  onOk: loadAnnonces,
  onDenied: () => {
    msg.textContent = "⛔ Accès refusé";
    rows.innerHTML = "";
  }
});
