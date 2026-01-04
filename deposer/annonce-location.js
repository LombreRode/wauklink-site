import { auth, db } from "../shared/firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const form = document.getElementById("form");
const msg  = document.getElementById("msg");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    location.replace("../auth/login.html");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      categorie: document.getElementById("categorie").value,
      titre: document.getElementById("titre").value.trim(),
      ville: document.getElementById("ville").value.trim(),
      prix: Number(document.getElementById("prix").value || 0),
      description: document.getElementById("description").value.trim(),

      ownerUid: user.uid,
      status: "pending",
      createdAt: serverTimestamp()
    };

    if (
      !data.categorie ||
      !data.titre ||
      !data.ville ||
      !data.description
    ) {
      msg.textContent = "❌ Tous les champs obligatoires doivent être remplis";
      return;
    }

    msg.textContent = "⏳ Publication en cours…";

    try {
      await addDoc(collection(db, "annonces"), data);
      msg.textContent =
        "✅ Annonce envoyée. Elle sera visible après validation.";
      form.reset();
    } catch (err) {
      console.error(err);
      msg.textContent = "❌ Erreur lors de la publication";
    }
  });
});
