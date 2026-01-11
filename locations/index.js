import { db } from "../shared/firebase.js";
import {
  collection,
  query,
  where,
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
      where("status", "==", "active")
    ];

    if (type) {
      constraints.push(where("type", "==", type));
    }

    const q = query(
      collection(db, "annonces"),
      ...constraints
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      msg.textContent = "Aucune annonce disponible.";
      return;
    }

    msg.textContent = `${snap.size} annonce(s)`;

    snap.forEach(doc => {
      const a = doc.data();

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${a.title ?? ""}</h3>
        <p class="meta">${a.city ?? ""}</p>
        <p>${a.description ?? ""}</p>
        <a class="btn"
           href="/wauklink-site/annonces/location-detail.html?id=${doc.id}">
          Voir
        </a>
      `;

      list.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    msg.textContent = "❌ Erreur de chargement des annonces";
  }
}

load();
