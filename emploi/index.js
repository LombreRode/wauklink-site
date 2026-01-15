import { db } from "../shared/firebase.js";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy 
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const jobList = document.getElementById("jobList");
const msg = document.getElementById("msg");

// Fonction pour échapper les caractères spéciaux (Sécurité XSS)
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, m => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[m]));

async function loadJobs() {
  try {
    // 1. Création de la requête
    // Note : Cette requête nécessite l'index dont on a parlé précédemment
    const q = query(
      collection(db, "annonces"),
      where("type", "==", "emploi"),
      where("status", "==", "active"),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      msg.textContent = "Aucune offre d'emploi n'est disponible pour le moment.";
      return;
    }

    msg.style.display = "none";
    jobList.innerHTML = "";

    snap.forEach(docSnap => {
      const job = docSnap.data();
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <h3>${esc(job.title)}</h3>
          <span class="badge-spec" style="background: var(--brand); font-size: 0.7rem;">Offre</span>
        </div>
        <p class="meta">📍 ${esc(job.city)} (${esc(job.postalCode)})</p>
        <p style="margin: 10px 0; line-height: 1.5;">
          ${esc(job.description.substring(0, 120))}...
        </p>
        <div style="margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
          <a href="/wauklink-site/annonces/location-detail.html?id=${docSnap.id}" class="btn btn-ok" style="width: 100%; display: block; text-align: center;">
            Voir les détails
          </a>
        </div>
      `;
      jobList.appendChild(card);
    });

  } catch (error) {
    console.error("Erreur lors du chargement des emplois :", error);
    msg.innerHTML = `❌ Erreur de chargement.<br><small>Assurez-vous d'avoir créé l'index dans la console Firebase.</small>`;
  }
}

// Lancement au chargement de la page
loadJobs();
