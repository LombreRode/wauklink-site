import { db } from "../shared/firebase.js";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const list  = document.getElementById("list");
const msg   = document.getElementById("msg");

/* ========= HELPERS ========= */
const esc = s =>
  String(s ?? "").replace(/[&<>"']/g, m =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m])
  );

function empty(text) {
  msg.textContent = text;
  list.innerHTML = "";
}

/* ========= LOAD ANNONCES ========= */
async function loadAnnonces() {
  list.innerHTML = "";
  msg.textContent = "⏳ Chargement des annonces…";

  try {
    // On ne montre que les annonces validées par l'admin
    const q = query(
      collection(db, "annonces"),
      where("status", "==", "active"),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      empty("❌ Aucune annonce disponible.");
      return;
    }

    msg.textContent = `${snap.size} annonce(s)`;

    snap.forEach(d => {
      const a = d.data();
      const shortDesc = (a.description || "").slice(0, 100);

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between;">
           <strong>${esc(a.title || "Annonce")}</strong>
           <span style="color:var(--primary); font-weight:bold;">${a.price ?? "—"} €</span>
        </div>

        <div class="meta" style="margin-bottom:10px;">
          📍 ${esc(a.city || "—")} • 🏠 ${esc(a.type || "—")}
        </div>

        <p class="meta">
          ${esc(shortDesc)}...
        </p>

        <div class="row-actions" style="margin-top:15px; display:flex; gap:10px;">
          <a class="btn btn-outline" style="flex:1; text-align:center;"
             href="/wauklink-site/annonces/location-detail.html?id=${d.id}">
             Voir
          </a>
          
          <a class="btn" style="background:#ff4444; color:white; border:none; padding:5px 10px;"
             href="/wauklink-site/annonces/reports-annonce.html?id=${d.id}" title="Signaler un problème">
             🚩
          </a>
        </div>
      `;

      list.appendChild(card);
    });

  } catch (err) {
    console.error("loadAnnonces error:", err);
    // Si l'index manque, le message s'affichera ici
    empty("❌ Erreur de chargement des annonces (Vérifiez l'index Firestore)");
  }
}

/* ========= INIT ========= */
loadAnnonces();
