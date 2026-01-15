import { auth, db } from "../shared/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const list = document.getElementById("mesAnnoncesList");
const msg = document.getElementById("msg");

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "/wauklink-site/auth/login.html";
        return;
    }

    try {
        // Requête pour récupérer uniquement les annonces de l'utilisateur connecté
        const q = query(
            collection(db, "annonces"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);

        if (snap.empty) {
            msg.textContent = "Vous n'avez pas encore publié d'annonce.";
            return;
        }

        msg.style.display = "none";
        list.innerHTML = "";

        snap.forEach(docSnap => {
            const data = docSnap.data();
            const statusClass = data.status === "active" ? "badge-success" : "badge-pending";
            const statusText = data.status === "active" ? "En ligne" : "En attente de validation";

            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <h3>${data.title}</h3>
                <p><strong>Rubrique :</strong> ${data.type}</p>
                <p><strong>Statut :</strong> <span class="badge ${statusClass}">${statusText}</span></p>
                <hr>
                <a href="/wauklink-site/annonces/location-detail.html?id=${docSnap.id}" class="btn">Voir l'annonce</a>
            `;
            list.appendChild(card);
        });
    } catch (err) {
        console.error(err);
        msg.textContent = "Erreur lors du chargement des annonces.";
    }
});
