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

async function loadUrgences() {
  msg.textContent = "Chargement…";
  list.innerHTML = "";

  try {
    const q = query(
      collection(db, "annonces"),
      where("status", "==", "active"),
      where("type", "==", "urgences"),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      msg.textContent = "Aucune urgence disponible pour le moment.";
      return;
    }

    msg.textContent = `${snap.size} urgence(s) disponible(s)`;

    snap.forEach(d => {
      const a = d.data();
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${a.title}</h3>
        <p class="meta">${a.city}</p>
        <p>${a.description}</p>
      `;
      list.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    msg.textContent = "❌ Erreur de chargement des urgences";
  }
}

loadUrgences();
