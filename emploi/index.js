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

// Protection contre les injections (XSS)
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, m => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[m]));

async function loadJobs() {
  try {
    // REQUÊTE : On filtre par type 'emploi' et statut 'active'
    // ⚠️ Rappel : Cette requête demande la création d'un index composé dans Firebase
    const q = query(
      collection(db, "annonces"),
      where("type", "==", "emploi"),
      where("status", "==", "active"),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      msg.textContent = "Aucune offre d'emploi disponible pour le moment.";
      return;
    }

    msg.style.display = "none";
    jobList.innerHTML = "";

    snap.forEach(docSnap => {
      const job = docSnap.data();
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h3 style="margin:0;">${esc(job.title)}</h3>
          <span class="badge-spec" style="background: var(--brand); font-size: 0.7rem;">RECRUTEMENT</span>
        </div>
        <p class="meta">📍 ${esc(job.city)} (${esc(job.postalCode)})</p>
        <p style="margin: 15px 0;">${esc(job.description.substring(0, 150))}...</p>
        <div style="margin-top: auto; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
          <a href="/wauklink-site/annonces/location-detail.html?id=${docSnap.id}" class="btn btn-ok" style="width: 100%; display: block; text-align: center;">
            Voir l'offre complète
          </a>
        </div>
      `;
      jobList.appendChild(card);
    });

  } catch (error) {
    console.error("Erreur Firebase :", error);
    msg.innerHTML = "❌ Erreur de chargement. <br><small>Vérifiez que l'index composé est bien créé dans Firebase.</small>";
  }
}

loadJobs();
