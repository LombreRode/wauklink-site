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

const TYPE = "travaux"; // 🔥 changer ici seulement

async function load() {
  msg.textContent = "Chargement…";
  list.innerHTML = "";

  try {
    const q = query(
      collection(db, "annonces"),
      where("status", "==", "active"),
      where("type", "==", TYPE),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);

    msg.textContent = "";

    if (snap.empty) {
      msg.textContent = "Aucune annonce disponible.";
      return;
    }

    snap.forEach(d => {
      const a = d.data();
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${a.title}</h3>
        <p class="meta">${a.city}</p>
        <p>${a.description}</p>
        <p><strong>Prix :</strong> ${a.price ?? "—"} €</p>
        <a class="btn btn-outline"
           href="/wauklink-site/annonce/index.html?id=${d.id}">
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

load();
