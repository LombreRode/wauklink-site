import { db } from "../shared/firebase.js";
import {
  collection, query, where, orderBy, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const list = document.getElementById("list");
const msg  = document.getElementById("statusMsg");

async function load() {
  msg.textContent = "Chargement…";
  list.innerHTML = "";

  const q = query(
    collection(db, "annonces"),
    where("status", "==", "active"),
    where("type", "==", "immobilier"),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    msg.textContent = "Aucune annonce.";
    return;
  }

  msg.textContent = `${snap.size} annonce(s)`;

  snap.forEach(d => {
    const a = d.data();
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${a.title}</h3>
      <p class="meta">${a.city}</p>
      <a class="btn"
         href="/wauklink-site/annonces/location-detail.html?id=${d.id}">
        Voir
      </a>
    `;
    list.appendChild(card);
  });
}

load();
