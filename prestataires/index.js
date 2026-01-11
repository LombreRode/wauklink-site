import { auth, db } from "../shared/firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  collection, query, where, orderBy, getDocs,
  doc, getDoc
} from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const statusMsg = document.getElementById("statusMsg");
const blocked   = document.getElementById("blocked");
const content   = document.getElementById("content");
const list      = document.getElementById("list");

const esc = s =>
  String(s ?? "").replace(/[&<>"']/g, m =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m])
  );

async function loadPrestataires() {
  list.innerHTML = "";
  const q = query(
    collection(db, "prestataires"),
    where("status", "==", "active"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);

  if (snap.empty) {
    list.innerHTML =
      "<p class='muted'>Aucun prestataire disponible.</p>";
    return;
  }

  snap.forEach(d => {
    const p = d.data();
    const el = document.createElement("div");
    el.className = "card";
    el.innerHTML = `
      <strong>${esc(p.nom || p.titre || "Prestataire")}</strong>
      <div class="muted">${esc(p.ville || "")}</div>
      <p>${esc(p.description || "")}</p>

      <a class="btn"
         href="/wauklink-site/annonces/location-detail.html?id=${d.id}">
        Voir
      </a>
    `;
    list.appendChild(el);
  });
}

onAuthStateChanged(auth, async user => {
  if (!user) {
    location.href = "../auth/login.html";
    return;
  }

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) {
    blocked.classList.remove("hidden");
    statusMsg.textContent = "Profil introuvable.";
    return;
  }

  const u = snap.data();
  const role = u.role || "user";
  const sub  = u.abonnement?.type || "free";
  const proValidated = u.pro?.validated === true;

  if (sub === "free") {
    blocked.classList.remove("hidden");
    statusMsg.textContent =
      "Abonnement requis pour accéder aux prestataires.";
    return;
  }

  if (sub === "partial" && role !== "pro") {
    statusMsg.textContent = "Accès autorisé.";
    content.classList.remove("hidden");
    loadPrestataires();
    return;
  }

  if (role === "pro" && !proValidated) {
    blocked.classList.remove("hidden");
    statusMsg.textContent = "Compte pro non validé.";
    return;
  }

  if (role === "pro" && proValidated) {
    statusMsg.textContent = "Accès autorisé.";
    content.classList.remove("hidden");
    loadPrestataires();
    return;
  }

  blocked.classList.remove("hidden");
  statusMsg.textContent = "Accès non autorisé.";
});
