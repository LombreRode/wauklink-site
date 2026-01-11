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

async function loadServices() {
  msg.textContent = "Chargement…";
  list.innerHTML = "";

  try {
    // ⚠️ PAS DE FILTRE TYPE (on évite les erreurs)
    const q = query(
      collection(db, "annonces"),
      where("status", "==", "active"),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      msg.textContent = "Aucun service disponible.";
      return;
    }

    msg.textContent = `${snap.size} annonce(s)`;

    snap.forEach(d => {
      const a = d.data();

      // 👉 on affiche UNIQUEMENT les services à la personne
      if (!a.type || !String(a.type).includes("service")) return;

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${a.title || ""}</h3>
        <p class="meta">${a.city || ""}</p>
        <p>${a.description || ""}</p>
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

loadServices();
