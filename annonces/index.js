import { db } from "../shared/firebase.js";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const list = document.getElementById("list");
const msg  = document.getElementById("msg");
const title = document.getElementById("pageTitle");

/* ========= helpers ========= */
const esc = s =>
  String(s ?? "").replace(/[&<>"']/g, m =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m])
  );

function empty(text) {
  msg.textContent = text;
  list.innerHTML = "";
}

/* ========= load annonces ========= */
async function loadAnnonces() {
  list.innerHTML = "";
  msg.textContent = "⏳ Chargement des annonces…";

  try {
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

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <strong>${esc(a.title || "Annonce")}</strong>
        <div class="meta">
          ${esc(a.city || "—")} • ${esc(a.type || "—")}
        </div>
        <div class="meta">
          ${a.price ?? "—"} €
        </div>
        <p class="meta" style="margin-top:8px">
          ${esc(a.description || "").slice(0, 120)}…
        </p>
        <div class="row-actions" style="margin-top:10px">
          <a class="btn btn-outline"
             href="/wauklink-site/annonces/view.html?id=${d.id}">
            Voir l’annonce
          </a>
        </div>
      `;

      list.appendChild(card);
    });

  } catch (err) {
    console.error("loadAnnonces error:", err);
    empty("❌ Erreur de chargement des annonces");
  }
}

/* ========= init ========= */
loadAnnonces();
