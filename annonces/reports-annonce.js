import { db, auth } from "../shared/firebase.js";
import { 
  collection, 
  addDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const reportForm = document.getElementById("reportForm");
const btnSubmit  = document.getElementById("btnSubmit");

// Récupération de l'ID de l'annonce depuis l'URL
const params = new URLSearchParams(window.location.search);
const annonceId = params.get("id");

if (!annonceId) {
    alert("❌ Erreur : Aucune annonce n'est sélectionnée.");
    window.location.href = "location.html";
}

reportForm.onsubmit = async (e) => {
    e.preventDefault();

    // L'utilisateur doit être connecté
    const user = auth.currentUser;
    if (!user) {
        alert("⚠️ Connectez-vous pour signaler cette annonce.");
        return;
    }

    const reason = document.getElementById("reason").value;
    const details = document.getElementById("details").value;

    btnSubmit.disabled = true;
    btnSubmit.textContent = "⌛ Envoi...";

    try {
        // AJOUT du document dans Firestore
        await addDoc(collection(db, "reports"), {
            annonceId: annonceId,
            reporterUid: user.uid,
            reporterEmail: user.email,
            reason: reason,
            details: details,
            status: "open", // Status pour l'admin
            createdAt: serverTimestamp()
        });

        alert("✅ Signalement transmis. Merci !");
        window.location.href = `location-detail.html?id=${annonceId}`;

    } catch (error) {
        console.error("Erreur d'envoi :", error);
        alert("❌ Impossible d'envoyer le signalement.");
        btnSubmit.disabled = false;
        btnSubmit.textContent = "Envoyer le signalement";
    }
};
