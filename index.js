import { db } from "./shared/firebase.js";
import { collection, query, where, getDocs, limit, orderBy } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const annonceList = document.getElementById("annonceList");

async function loadLatestAnnonces() {
    if (!annonceList) return;
    annonceList.innerHTML = "<p class='meta'>Chargement des dernières pépites...</p>";

    try {
        // On récupère les 6 dernières annonces actives
        const q = query(
            collection(db, "annonces"),
            where("status", "==", "active"),
            orderBy("createdAt", "desc"),
            limit(6)
        );

        const snap = await getDocs(q);

        if (snap.empty) {
            annonceList.innerHTML = "<p class='meta'>Aucune annonce disponible pour le moment.</p>";
            return;
        }

        annonceList.innerHTML = ""; // On vide le message de chargement

        snap.forEach(docSnap => {
            const a = docSnap.data();
            const photoUrl = (a.photos && a.photos.length > 0) ? a.photos[0] : "./assets/no-photo.png";

            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <img src="${photoUrl}" alt="${a.title}" class="img-preview">
                <span class="badge-spec">${a.specialite || a.type}</span>
                <h3 style="margin-top:10px;">${a.title}</h3>
                <p class="meta">📍 ${a.city} • ${a.postalCode}</p>
                <div class="price-box">${a.price > 0 ? a.price + ' €' : 'Sur devis'}</div>
                
                <a href="/wauklink-site/annonces/location-detail.html?id=${docSnap.id}" class="btn btn-ok">
                    Voir l'annonce
                </a>
            `;
            annonceList.appendChild(card);
        });

    } catch (err) {
        console.error("Erreur Home:", err);
        annonceList.innerHTML = "<p class='meta'>Impossible de charger les annonces. Vérifiez votre connexion.</p>";
    }
}

loadLatestAnnonces();
