import { db } from "../shared/firebase.js";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const statusMsg = document.getElementById("statusMsg");
const list = document.getElementById("list");
const emptyMsg = document.getElementById("empty");

const esc = s =>
  String(s ?? "").replace(/[&<>"']/g, m =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m])
  );

async function loadUrgences() {
  statusMsg.textContent = "Chargement…";
  list.innerHTML = "";

  const q = query(
    collection(db, "annonces"),
    where("status", "==", "active"),
    where("type", "==", "urgences"),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  statusMsg.textContent = "";

  if (snap.empty) {
    emptyMsg.classList.remove("hidden");
    return;
  }

  emptyMsg.classList.add("hidden");

  snap.forEach(d => {
    const a = d.data();
    const el = document.createElement("div");
    el.className = "card";
    el.innerHTML = `
      <h3>${esc(a.title)}</h3>
      <p class="meta">${esc(a.city)}</p>
      <p>${esc(a.description || "")}</p>
      <p><strong>Prix :</strong> ${a.price ?? "—"} €</p>

      <a class="btn"
         href="/wauklink-site/annonces/location-detail.html?id=${d.id}">
        Voir
      </a>
    `;
    list.appendChild(el);
  });
}

loadUrgences();
