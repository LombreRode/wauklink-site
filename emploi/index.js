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

const esc = s => String(s ?? "").replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));

async function loadJobs() {
    jobList.innerHTML = "";
    msg.textContent = "⏳ Chargement des offres...";

    try {
        // Recherche dans la collection "jobs" (ou "annonces" avec type "emploi")
        const q = query(
            collection(db, "jobs"), 
            where("status", "==", "active"), 
            orderBy("createdAt", "desc")
        );
        
        const snap = await getDocs(q);

        if (snap.empty) {
            msg.textContent = "Aucune offre d'emploi disponible pour le moment.";
            return;
        }

        msg.textContent = `${snap.size} offre(s) trouvée(s)`;

        snap.forEach(d => {
            const j = d.data();
            const card = document.createElement("div");
            card.className = "card";
            
            card.innerHTML = `
                <span class="badge-spec">${esc(j.contractType || "Emploi")}</span>
                
                <h3 style="margin-top:10px;">${esc(j.title)}</h3>
                <p class="meta">🏢 ${esc(j.company || "Entreprise")}</p>
                
                <div class="price-box" style="font-size: 1.2rem;">
                    ${j.salary ? esc(j.salary) : "Salaire non indiqué"}
                </div>
                
                <p class="meta">📍 ${esc(j.city)}</p>
                
                <div style="margin-top:15px;">
                    <a href="/wauklink-site/emploi/job-detail.html?id=${d.id}" class="btn btn-outline" style="width:100%; text-align:center;">
                        Voir l'offre
                    </a>
                </div>
            `;
            jobList.appendChild(card);
        });
    } catch (err) {
        console.error("Erreur Emploi:", err);
        msg.textContent = "❌ Impossible de charger les offres.";
    }
}

loadJobs();
