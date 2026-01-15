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

async function loadJobs() {
  try {
    // Cette requête demande l'index que vous allez créer à l'étape 2
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

      // Design de la carte Emploi
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between;">
          <h3 style="margin:0;">${job.title}</h3>
          <span class="badge-spec" style="background: #27ae60; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem;">RECRUTEMENT</span>
        </div>
        <p class="meta">📍 ${job.city} (${job.postalCode})</p>
        <p style="margin: 10px 0;">${job.description.substring(0, 150)}...</p>
        <a href="/wauklink-site/annonces/location-detail.html?id=${docSnap.id}" class="btn btn-ok" style="width: 100%; display: block; text-align: center;">Voir l'offre</a>
      `;
      jobList.appendChild(card);
    });
  } catch (error) {
    console.error("Erreur Emploi:", error);
    msg.innerHTML = "❌ Erreur de chargement. Vérifiez si l'index Firebase est prêt.";
  }
}

loadJobs();
