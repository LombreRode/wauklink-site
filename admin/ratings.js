// ratings.js
import { auth, db } from "../shared/firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  addDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ========= DOM ========= */
const form = document.getElementById("form");
const msg = document.getElementById("msg");
const ratingEl = document.getElementById("rating");
const commentEl = document.getElementById("comment");

if (!form || !msg || !ratingEl || !commentEl) {
  console.error("❌ ratings.js : éléments DOM manquants");
}

/* ========= AUTH ========= */
onAuthStateChanged(auth, user => {
  if (!user) {
    msg.textContent = "❌ Vous devez être connecté pour laisser un avis.";
    form.classList.add("hidden");
    return;
  }

  msg.textContent = "✅ Connecté — vous pouvez laisser un avis.";
  form.classList.remove("hidden");

  form.onsubmit = async e => {
    e.preventDefault();

    const rating = Number(ratingEl.value);
    const comment = commentEl.value.trim();

    if (!rating || rating < 1 || rating > 5) {
      msg.textContent = "❌ Veuillez sélectionner une note valide.";
      return;
    }

    if (!comment) {
      msg.textContent = "❌ Le commentaire est requis.";
      return;
    }

    msg.textContent = "⏳ Envoi de l’avis…";

    try {
      await addDoc(collection(db, "ratings"), {
        userId: user.uid,
        rating,
        comment,
        createdAt: serverTimestamp()
      });

      msg.textContent = "✅ Avis envoyé. Merci 🙏";
      form.reset();
    } catch (err) {
      console.error("ratings error:", err);
      msg.textContent = "❌ Erreur lors de l’envoi de l’avis.";
    }
  };
});
