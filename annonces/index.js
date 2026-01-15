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
    // 1. On ne récupère que les annonces validées (status == 'active')
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
      card.className = "card"; // Utilise l'animation fadeInUp de ton CSS
      
      card.innerHTML = `
        <span class="badge-spec">${esc(a.specialite || a.type)}</span>

        <div style="display:flex; justify-content:space-between; align-items: flex-start; margin-top:10px;">
           <strong style="font-size:1.1rem;">${esc(a.title || "Annonce")}</strong>
        </div>

        <div class="price-box">${a.price ? a.price + ' €' : 'Sur devis'}</div>

        <div class="meta" style="margin-bottom:10px;">
          📍 ${esc(a.city || "—")}
        </div>

        <p class="meta">
          ${esc(shortDesc)}...
        </p>

        <div class="row-actions" style="margin-top:15px; display:flex; gap:10px;">
          <a class="btn btn-outline" style="flex:1; text-align:center;"
             href="/wauklink-site/annonces/location-detail.html?id=${d.id}">
             Voir les détails
          </a>
          
          <a class="btn" style="background:var(--danger); color:white; border:none; padding:5px 12px; border-radius:8px;"
             href="/wauklink-site/annonces/reports-annonce.html?id=${d.id}" title="Signaler un problème">
             🚩
          </a>
        </div>
      `;

      list.appendChild(card);
    });

  } catch (err) {
    console.error("loadAnnonces error:", err);
    empty("❌ Erreur de chargement (Vérifiez votre connexion ou l'index Firestore)");
  }
}

/* ========= INIT ========= */
loadAnnonces();
