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
const subtitle = document.getElementById("subtitle");

const params = new URLSearchParams(location.search);
const type = params.get("type"); // immobilier | loisir | autres

subtitle.textContent = type
  ? `Annonces : ${type}`
  : "Toutes les annonces";

async function load() {
  msg.textContent = "Chargement…";
  list.innerHTML = "";

  try {
    const constraints = [
      where("status", "==", "active"),
      orderBy("createdAt", "desc")
    ];

    if (type) {
      constraints.unshift(where("type", "==", type));
    }

    const q = query(collection(db, "annonces"), ...constraints);
    const snap = await getDocs(q);

    if (snap.empty) {
      msg.textContent = "Aucune annonce disponible.";
      return;
    }

    msg.textContent = `${snap.size} annonce(s)`;

    snap.forEach(d => {
      const a = d.data();
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${a.title || ""}</h3>
        <p class="meta">${a.city || ""}</p>
        <p>${a.description || ""}</p>
        <a class="btn"
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

load();
