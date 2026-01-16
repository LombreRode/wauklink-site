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

// --- AJOUTE CECI À LA FIN DE TON FICHIER INDEX.JS ---

import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { auth } from "./shared/firebase.js";

onAuthStateChanged(auth, (user) => {
    const userNav = document.getElementById("userNav");
    const guestStatus = document.getElementById("guestStatus");

    if (user) {
        // Si connecté : on montre le profil, on cache l'inscription
        if (userNav) userNav.classList.remove("hidden");
        if (guestStatus) guestStatus.classList.add("hidden");
        
        // Si l'utilisateur a une photo, on l'affiche dans le petit rond
        const navAvatar = document.getElementById("navAvatar");
        if (navAvatar && user.photoURL) {
            navAvatar.src = user.photoURL;
        }
    } else {
        // Si déconnecté : on cache le profil, on montre l'inscription
        if (userNav) userNav.classList.add("hidden");
        if (guestStatus) guestStatus.classList.remove("hidden");
    }
});

// Gérer le clic sur le bouton déconnexion
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.onclick = async () => {
        await signOut(auth);
        window.location.reload(); // Rafraîchit la page après déconnexion
    };
}

// Enfin, on n'oublie pas de lancer le chargement des annonces
loadLatestAnnonces();
