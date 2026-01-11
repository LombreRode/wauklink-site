import { db } from "../shared/firebase.js";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const list = document.getElementById("list");
const msg  = document.getElementById("statusMsg");

const esc = s =>
  String(s ?? "").replace(/[&<>"']/g, m =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m])
  );

async function loadTravaux() {
  msg.textContent = "Chargement…";
  list.innerHTML = "";

  try {
    const q = query(
      collection(db, "annonces"),
      where("status", "==", "active"),
      where("type", "==", "travaux"),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      msg.textContent = "Aucune annonce travaux disponible.";
      return;
    }

    msg.textContent = `${snap.size} annonce(s)`;

    snap.forEach(d => {
      const a = d.data();
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${esc(a.title)}</h3>
        <p class="meta">${esc(a.city)}</p>
        <p>${esc(a.description || "")}</p>
        <p><strong>Prix :</strong> ${a.price ?? "—"} €</p>

        <a class="btn btn-outline"
           href="/wauklink-site/annonces/location-detail.html?id=${d.id}">
          Voir
        </a>
      `;
      list.appendChild(card);
    });

  } catch (e) {
    console.error(e);
    msg.textContent = "❌ Erreur de chargement";
  }
}

loadTravaux();
