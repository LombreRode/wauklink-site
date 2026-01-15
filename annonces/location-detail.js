// location-detail.js — VERSION FINALE WAUKLINK
import { db, auth } from "../shared/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc, getDoc, collection, addDoc, query, where, getDocs, serverTimestamp, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ========= DOM ELEMENTS ========= */
const msg = document.getElementById("msg");
const box = document.getElementById("annonce");
const titre = document.getElementById("titre");
const meta = document.getElementById("meta");
const description = document.getElementById("description");
const photos = document.getElementById("photos");
const displayPrice = document.getElementById("displayPrice");
const badgeSpec = document.getElementById("badgeSpec");
const callBtn = document.getElementById("callBtn");

// Éléments Avis
const ratingSection = document.getElementById("ratingSection");
const ratingValue = document.getElementById("ratingValue");
const ratingComment = document.getElementById("ratingComment");
const rateBtn = document.getElementById("rateBtn");
const reviewsList = document.getElementById("reviewsList");

// Éléments Signalement
const reportSection = document.getElementById("reportSection");
const reportLink = document.getElementById("reportLink");

/* ========= PARAMÈTRES URL ========= */
const annonceId = new URLSearchParams(location.search).get("id");
let ownerId = null; 

if (!annonceId) {
  msg.textContent = "❌ Annonce introuvable (ID manquant)";
} else {
  loadAnnonce();
}

/* ========= CHARGEMENT DE L'ANNONCE ========= */
async function loadAnnonce() {
  msg.textContent = "⏳ Chargement des détails...";
  try {
    const snap = await getDoc(doc(db, "annonces", annonceId));

    if (!snap.exists()) {
      msg.textContent = "❌ Cette annonce n'existe plus.";
      return;
    }

    const a = snap.data();
    ownerId = a.userId;

    // Affichage des textes
    titre.textContent = a.title || "Sans titre";
    badgeSpec.textContent = a.specialite || a.type || "Général";
    
    // Meta : Ville + Date
    const datePub = a.createdAt?.toDate().toLocaleDateString() || "récemment";
    meta.textContent = `📍 ${a.city || "—"} (${a.postalCode || "—"}) • Publié le ${datePub}`;
    
    // Prix
    displayPrice.textContent = a.price > 0 ? `${a.price} €` : "Prix sur devis / Gratuit";
    
    // Description
    description.textContent = a.description || "Aucune description fournie.";

    // Téléphone & Bouton d'appel
    if (a.phone) {
      callBtn.href = `tel:${a.phone}`;
      callBtn.textContent = `📞 Appeler (${a.phone})`;
      callBtn.classList.remove("hidden");
    } else {
      callBtn.classList.add("hidden");
    }

    // Gestion des Photos
    photos.innerHTML = "";
    if (a.photos && a.photos.length > 0) {
      a.photos.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        img.style.cursor = "pointer";
        img.onclick = () => window.open(url, '_blank'); // Agrandir au clic
        photos.appendChild(img);
      });
    }

    // Affichage des blocs
    box.classList.remove("hidden");
    msg.classList.add("hidden");

    // Lancer le chargement des avis
    loadReviews(ownerId);

  } catch (err) {
    console.error(err);
    msg.textContent = "❌ Erreur lors de la récupération des données.";
  }
}

/* ========= CHARGER LES AVIS ========= */
async function loadReviews(targetId) {
  if (!reviewsList) return;
  reviewsList.innerHTML = "<p class='meta'>Chargement des avis...</p>";

  try {
    const q = query(
      collection(db, "reviews"),
      where("targetId", "==", targetId),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);
    if (snap.empty) {
      reviewsList.innerHTML = "<p class='meta'>Soyez le premier à laisser un avis !</p>";
      return;
    }

    reviewsList.innerHTML = "";
    snap.forEach(d => {
      const r = d.data();
      const div = document.createElement("div");
      div.className = "card";
      div.style.marginBottom = "10px";
      div.innerHTML = `
        <div style="color:#f1c40f; margin-bottom:5px;">${"⭐".repeat(r.rating)}</div>
        <p style="margin:0; font-size:0.95rem;">${r.comment || ""}</p>
        <small class="meta" style="font-size:0.8rem;">Le ${r.createdAt?.toDate().toLocaleDateString()}</small>
      `;
      reviewsList.appendChild(div);
    });
  } catch (e) {
    console.error("Erreur reviews:", e);
    reviewsList.innerHTML = "";
  }
}

/* ========= AUTH & LOGIQUE D'AVIS ========= */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    ratingSection.classList.add("hidden");
    if (reportSection) reportSection.classList.add("hidden");
    return;
  }

  // Activer le signalement
  if (reportSection) {
    reportSection.classList.remove("hidden");
    reportLink.href = `/wauklink-site/annonces/reports-annonce.html?id=${annonceId}`;
  }

  // Ne pas noter soi-même
  if (ownerId && user.uid === ownerId) {
    ratingSection.innerHTML = `<p class="meta">💡 Vous ne pouvez pas noter votre propre annonce.</p>`;
    ratingSection.classList.remove("hidden");
    return;
  }

  // Vérifier si déjà noté
  try {
    const qNote = query(collection(db, "reviews"), where("targetId", "==", ownerId), where("authorId", "==", user.uid));
    const snapNote = await getDocs(qNote);
    
    if (!snapNote.empty) {
      ratingSection.innerHTML = `<p class="meta">✅ Vous avez déjà noté ce prestataire.</p>`;
      ratingSection.classList.remove("hidden");
    } else {
      ratingSection.classList.remove("hidden");
      
      rateBtn.onclick = async () => {
        const rating = Number(ratingValue.value);
        const comment = ratingComment.value.trim();

        if (!rating) return alert("Choisissez une note !");
        if (comment.length < 5) return alert("Laissez un commentaire un peu plus long.");

        rateBtn.disabled = true;
        rateBtn.textContent = "Envoi...";

        try {
          await addDoc(collection(db, "reviews"), {
            targetId: ownerId,
            authorId: user.uid,
            rating,
            comment,
            annonceId,
            createdAt: serverTimestamp()
          });
          alert("⭐ Merci ! Votre avis a été publié.");
          location.reload();
        } catch (err) {
          alert("Erreur lors de l'envoi.");
          rateBtn.disabled = false;
        }
      };
    }
  } catch (e) { console.error(e); }
});
