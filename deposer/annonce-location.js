import { auth, db } from "../shared/firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const form = document.getElementById("annonceForm");
const msg  = document.getElementById("msg");

if (!form) {
  console.error("Formulaire annonce introuvable");
}

onAuthStateChanged(auth, (user) => {
  if (!user || !form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const title = document.getElementById("title")?.value.trim();
    const city = document.getElementById("city")?.value.trim();
    const phone = document.getElementById("phone")?.value.trim();
    const postalCode = document.getElementById("postalCode")?.value.trim();
    const type = document.getElementById("type")?.value;
    const price = Number(document.getElementById("price")?.value);
    const description = document.getElementById("description")?.value.trim();

    if (!title || !city || !type || !description || !phone || !postalCode) {
      msg.textContent =
        "Tous les champs sont obligatoires (téléphone et code postal inclus).";
      return;
    }

    try {
      await addDoc(collection(db, "annonces"), {
        title,
        city,
        postalCode,
        phone,
        type,
        price,
        description,
        userId: user.uid,
        status: "pending",
        createdAt: serverTimestamp()
      });

      msg.textContent = "Annonce publiée avec succès 🎉";
      form.reset();

    } catch (err) {
      console.error(err);
      msg.textContent = "Erreur lors de la publication.";
    }
  });
});
