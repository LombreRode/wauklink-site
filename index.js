import { db, auth } from "./shared/firebase.js";
import { collection, query, where, getDocs, limit, orderBy } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// --- 1. GESTION DE L'UTILISATEUR (Profil / Connexion) ---

onAuthStateChanged(auth, (user) => {
    const userNav = document.getElementById("userNav");
    const guestStatus = document.getElementById("guestStatus");
    const navAvatar = document.getElementById("navAvatar");

    if (user) {
        // Utilisateur connecté : on montre le profil, on cache l'inscription
        if (userNav) userNav.classList.remove("hidden");
        if (guestStatus) guestStatus.classList.add("hidden");
        if (navAvatar && user.photoURL) navAvatar.src = user.photoURL;
    } else {
        // Utilisateur déconnecté : on cache le profil, on montre l'inscription
        if (userNav) userNav.classList.add("hidden");
        if (guestStatus) guestStatus.classList.remove("hidden");
    }
});

// Bouton Déconnexion
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.onclick = async () => {
        await signOut(auth);
        window.location.reload();
    };
}

// --- 2. AFFICHAGE DES ANNONCES ---

const annonceList = document.getElementById("annonceList");

async function loadLatestAnnonces() {
    // Si la liste n'existe pas sur cette page, on s'arrête
    if (!annonceList) return;

    annonceList.innerHTML = "<p class='meta'>Chargement des dernières pépites...</p>";

    try {
        const q = query(
            collection(db, "annonces"),
            where("status", "==", "active"),
            orderBy("createdAt", "desc"),
            limit(6)
        );

        const snap = await getDocs(q);

        if (snap.empty) {
            annonceList.innerHTML = "<p class='meta'>Aucune annonce disponible.</p>";
            return;
        }

        annonceList.innerHTML = ""; // On vide le message de chargement

        snap.forEach(docSnap => {
            const a = docSnap.data();
            // On vérifie si y'a des images, sinon image par défaut
            const photoUrl = (a.images && a.images.length > 0) ? a.images[0] : "./assets/no-photo.png";

            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <img src="${photoUrl}" alt="${a.title}" class="img-preview" style="width:100%; border-radius:8px;">
                <span class="badge-spec" style="background:#004d40; color:white; padding:2px 8px; border-radius:4px; font-size:12px;">
                    ${a.specialite || a.type}
                </span>
                <h3 style="margin-top:10px;">${a.title}</h3>
                <p class="meta">📍 ${a.city} (${a.postalCode || ''})</p>
                <div class="price-box" style="font-weight:bold; margin:10px 0;">
                    ${a.price > 0 ? a.price + ' €' : 'Sur devis'}
                </div>
                <a href="/wauklink-site/annonces/location-detail.html?id=${docSnap.id}" class="btn btn-ok" style="display:block; text-align:center; text-decoration:none;">
                    Voir l'annonce
                </a>
            `;
            annonceList.appendChild(card);
        });

    } catch (err) {
        console.error("Erreur chargement annonces:", err);
        annonceList.innerHTML = "<p class='meta'>Erreur de connexion aux annonces.</p>";
    }
}

// Lancement automatique du chargement
loadLatestAnnonces();
