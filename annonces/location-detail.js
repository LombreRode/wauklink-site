// location-detail.js
import { db, auth } from "../shared/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ========= DOM ========= */
const msg = document.getElementById("msg");
const box = document.getElementById("annonce");
const titre = document.getElementById("titre");
const meta = document.getElementById("meta");
const description = document.getElementById("description");
const photos = document.getElementById("photos");
const ratingSection = document.getElementById("ratingSection");
const ratingValue = document.getElementById("ratingValue");
const rateBtn = document.getElementById("rateBtn");

// Éléments pour le signalement
const reportSection = document.getElementById("reportSection");
const reportLink = document.getElementById("reportLink");

/* ========= PARAM ========= */
const annonceId = new URLSearchParams(location.search).get("id");
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

    // Sécurité : on ne montre que les annonces actives
    if (a.status !== "active") {
      msg.textContent = "⛔ Cette annonce n’est plus disponible";
      return;
    }

    titre.textContent = a.title || "Annonce";
    meta.textContent = `${a.city || "—"} • ${a.type || "—"} • ${a.price ?? "—"} €`;
    description.textContent = a.description || "";

    photos.innerHTML = "";
    if (Array.isArray(a.photos) && a.photos.length) {
      a.photos.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        img.style.maxWidth = "200px";
        img.style.borderRadius = "10px";
        img.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
        photos.appendChild(img);
      });
    } else {
      photos.innerHTML = `<p class="meta">Aucune photo disponible</p>`;
    }

    box.classList.remove("hidden");
    msg.textContent = "";
  } catch (err) {
    console.error(err);
    msg.textContent = "❌ Erreur de chargement";
  }
}

/* ========= AUTH & ACTIONS (Rating + Report) ========= */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // Si déconnecté, on cache tout
    ratingSection.classList.add("hidden");
    if (reportSection) reportSection.classList.add("hidden");
    return;
  }

  // --- PARTIE SIGNALEMENT ---
  if (reportSection && reportLink) {
    reportSection.classList.remove("hidden");
    // On injecte l'ID de l'annonce dans l'URL du lien de signalement
    reportLink.href = `/wauklink-site/annonces/reports-annonce.html?id=${annonceId}`;
  }

  // --- PARTIE NOTATION ---
  const q = query(
    collection(db, "ratings"),
    where("annonceId", "==", annonceId),
    where("userId", "==", user.uid)
  );

  const snap = await getDocs(q);
  if (!snap.empty) {
    ratingSection.innerHTML = `<p class="meta">⭐ Vous avez déjà noté cette annonce</p>`;
  } else {
    ratingSection.classList.remove("hidden");
    
    rateBtn.onclick = async () => {
      const rating = Number(ratingValue.value);
      if (rating < 1 || rating > 5) {
        alert("❌ Veuillez choisir une note");
        return;
      }

      rateBtn.disabled = true;
      rateBtn.textContent = "Envoi…";

      try {
        await addDoc(collection(db, "ratings"), {
          annonceId,
          userId: user.uid,
          rating,
          createdAt: serverTimestamp()
        });

        ratingSection.innerHTML = `<p class="meta">✅ Merci pour votre note !</p>`;
      } catch (err) {
        console.error(err);
        alert("❌ Erreur lors de l’envoi");
        rateBtn.disabled = false;
        rateBtn.textContent = "Noter";
      }
    };
  }
});

/* ========= INIT ========= */
loadAnnonce();
