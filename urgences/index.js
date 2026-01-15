import { db } from "../shared/firebase.js";
import { collection, query, where, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { wauklinkCategories } from "../shared/categories_data.js";

const statusMsg = document.getElementById("statusMsg");
const list = document.getElementById("list");
const emptyMsg = document.getElementById("empty");
const filterSpec = document.getElementById("filterSpec");

// --- 1. Remplir le filtre des spécialités ---
if (wauklinkCategories["urgences"]) {
    wauklinkCategories["urgences"].specs.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s;
        opt.textContent = s;
        filterSpec.appendChild(opt);
    });
}

const esc = s =>
  String(s ?? "").replace(/[&<>"']/g, m =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m])
  );

// --- 2. Fonction de chargement avec filtre ---
async function loadUrgences(specChoice = "") {
  statusMsg.textContent = "Recherche en cours…";
  list.innerHTML = "";
  emptyMsg.classList.add("hidden");

  try {
    let q = query(
      collection(db, "annonces"),
      where("status", "==", "active"), // ou "pending" si tu n'as pas encore validé tes tests
      where("type", "==", "urgences"),
      orderBy("createdAt", "desc")
    );

    // Si l'utilisateur choisit une spécialité (ex: Serrurerie)
    if (specChoice !== "") {
        q = query(q, where("specialite", "==", specChoice));
    }

    const snap = await getDocs(q);
    statusMsg.textContent = "";

    if (snap.empty) {
      emptyMsg.classList.remove("hidden");
      return;
    }

    snap.forEach(d => {
      const a = d.data();
      const el = document.createElement("div");
      el.className = "card";
      
      // Image par défaut si pas de photo
      const photoUrl = (a.photos && a.photos.length > 0) ? a.photos[0] : "../assets/avatar-default.png";

      el.innerHTML = `
        <img src="${photoUrl}" alt="Photo">
        <div class="badge-spec">${esc(a.specialite || "Urgence")}</div>
        <h3>${esc(a.title)}</h3>
        <p class="meta">📍 ${esc(a.city)} (${esc(a.postalCode)})</p>
        <p><strong>Prix :</strong> ${a.price > 0 ? a.price + " €" : "Sur devis"}</p>

        <a class="btn btn-ok" 
           style="display:block; text-align:center; margin-top:10px;"
           href="/wauklink-site/annonces/location-detail.html?id=${d.id}">
          Voir l'intervention
        </a>
      `;
      list.appendChild(el);
    });
  } catch (err) {
    console.error("Erreur Firestore:", err);
    statusMsg.textContent = "Erreur lors du chargement des données.";
  }
}

// --- 3. Écouteur de changement sur le filtre ---
filterSpec.addEventListener("change", (e) => {
    loadUrgences(e.target.value);
});

// Lancement initial
loadUrgences();
