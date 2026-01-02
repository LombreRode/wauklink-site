import { auth, db } from "../shared/firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  addDoc, collection, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const form = document.getElementById("form");
const msg = document.getElementById("msg");
const ratingEl = document.getElementById("rating");
const commentEl = document.getElementById("comment");

onAuthStateChanged(auth, user => {
  if (!user) {
    msg.textContent = "❌ Vous devez être connecté pour laisser un avis.";
    return;
  }

  msg.textContent = "✅ Connecté — vous pouvez laisser un avis.";
  form.classList.remove("hidden");

  form.onsubmit = async e => {
    e.preventDefault();

    msg.textContent = "⏳ Envoi de l’avis…";

    try {
      await addDoc(collection(db, "ratings"), {
        userId: user.uid,
        rating: Number(ratingEl.value),
        comment: commentEl.value.trim(),
        createdAt: serverTimestamp()
      });

      msg.textContent = "✅ Avis envoyé. Merci 🙏";
      form.reset();

    } catch (err) {
      console.error(err);
      msg.textContent = "❌ Erreur lors de l’envoi.";
    }
  };
});
