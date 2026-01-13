// location-detail.js
import { db, auth } from "../shared/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc, getDoc, collection, addDoc, query, where, getDocs, serverTimestamp, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ========= DOM ========= */
const msg = document.getElementById("msg");
const box = document.getElementById("annonce");
const titre = document.getElementById("titre");
const meta = document.getElementById("meta");
const description = document.getElementById("description");
const photos = document.getElementById("photos");

// Éléments Avis (Assure-toi que ces IDs existent dans ton HTML)
const ratingSection = document.getElementById("ratingSection");
const ratingValue = document.getElementById("ratingValue"); // Le <select>
const ratingComment = document.getElementById("ratingComment"); // Le <textarea>
const rateBtn = document.getElementById("rateBtn");
const reviewsList = document.getElementById("reviewsList"); // Le <div> pour la liste

// Éléments Signalement
const reportSection = document.getElementById("reportSection");
const reportLink = document.getElementById("reportLink");

/* ========= PARAM ========= */
const annonceId = new URLSearchParams(location.search).get("id");
let ownerId = null; // Pour stocker l'ID du prestataire

if (!annonceId) {
  msg.textContent = "❌ Annonce introuvable";
  throw new Error("ID annonce manquant");
}

/* ========= LOAD ANNONCE ========= */
async function loadAnnonce() {
  msg.textContent = "⏳ Chargement…";
  try {
    const ref = doc(db, "annonces", annonceId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      msg.textContent = "❌ Annonce introuvable";
      return;
    }

    const a = snap.data();
    ownerId = a.userId; // On récupère l'ID du créateur de l'annonce

    if (a.status !== "active") {
      msg.textContent = "⛔ Cette annonce n’est plus disponible";
      return;
    }

    titre.textContent = a.title || "Annonce";
    meta.textContent = `${a.city || "—"} • ${a.type || "—"} • ${a.price ?? "—"} €`;
    description.textContent = a.description || "";

    // Photos
    photos.innerHTML = "";
    if (Array.isArray(a.photos) && a.photos.length) {
      a.photos.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        img.className = "img-preview"; // Utilise tes classes CSS
        photos.appendChild(img);
      });
    }

    box.classList.remove("hidden");
    msg.textContent = "";

    // Une fois l'annonce chargée, on affiche les avis sur ce prestataire
    loadReviews(ownerId);

  } catch (err) {
    console.error(err);
    msg.textContent = "❌ Erreur de chargement";
  }
}

/* ========= CHARGER LES AVIS (Reviews) ========= */
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
      reviewsList.innerHTML = "<p class='meta'>Aucun avis pour le moment.</p>";
      return;
    }

    reviewsList.innerHTML = "";
    snap.forEach(d => {
      const r = d.data();
      const div = document.createElement("div");
      div.className = "review-item mb";
      div.innerHTML = `
        <div style="color:#f1c40f;">${"⭐".repeat(r.rating)}</div>
        <p style="margin:5px 0;">${r.comment || ""}</p>
        <small class="meta">Le ${r.createdAt?.toDate().toLocaleDateString()}</small>
      `;
      reviewsList.appendChild(div);
    });
  } catch (e) {
    console.error(e);
    reviewsList.innerHTML = "";
  }
}

/* ========= AUTH & ACTIONS ========= */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    ratingSection.classList.add("hidden");
    if (reportSection) reportSection.classList.add("hidden");
    return;
  }

  // --- SIGNALEMENT ---
  if (reportSection && reportLink) {
    reportSection.classList.remove("hidden");
    reportLink.href = `/wauklink-site/annonces/reports-annonce.html?id=${annonceId}`;
  }

  // --- NOTATION ---
  // On ne peut pas noter sa propre annonce
  if (ownerId && user.uid === ownerId) {
    ratingSection.innerHTML = `<p class="meta">Ceci est votre annonce.</p>`;
    return;
  }

  // Vérifier si déjà noté (dans la collection reviews désormais)
  const q = query(
    collection(db, "reviews"),
    where("targetId", "==", ownerId),
    where("authorId", "==", user.uid)
  );

  const snap = await getDocs(q);
  if (!snap.empty) {
    ratingSection.innerHTML = `<p class="meta">⭐ Vous avez déjà noté ce prestataire</p>`;
  } else {
    ratingSection.classList.remove("hidden");
    
    rateBtn.onclick = async () => {
      const rating = Number(ratingValue.value);
      const comment = ratingComment ? ratingComment.value.trim() : "";

      if (rating < 1 || rating > 5) return alert("Note invalide");
      if (comment.length < 3) return alert("Veuillez laisser un petit commentaire");

      rateBtn.disabled = true;
      rateBtn.textContent = "Envoi…";

      try {
        await addDoc(collection(db, "reviews"), {
          targetId: ownerId,      // Le prestataire
          authorId: user.uid,     // L'auteur
          rating,
          comment,
          annonceId,              // Pour savoir de quelle annonce ça vient
          createdAt: serverTimestamp()
        });

        alert("✅ Merci pour votre avis !");
        location.reload();
      } catch (err) {
        console.error(err);
        alert("❌ Erreur lors de l’envoi");
        rateBtn.disabled = false;
        rateBtn.textContent = "Noter";
      }
    };
  }
});

loadAnnonce();
