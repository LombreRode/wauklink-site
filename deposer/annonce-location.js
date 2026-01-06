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

// Sécurité : formulaire absent
if (!form) {
  console.error("Formulaire annonce introuvable");
}

onAuthStateChanged(auth, (user) => {
  if (!user || !form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const title = document.getElementById("title")?.value.trim();
    const phone = document.getElementById("phone")?.value.trim();
    const postalCode = document.getElementById("postalCode")?.value.trim();
    const city = document.getElementById("city")?.value.trim();
    const type = document.getElementById("type")?.value;
    const price = Number(document.getElementById("price")?.value);
    const description = document.getElementById("description")?.value.trim();

    if (!title || !city || !type || !description) {
      msg.textContent = "Tous les champs sont obligatoires.";
      return;
    }

    try {
      await addDoc(collection(db, "annonces"), {
        title,
        city,
        type,
        price,
        description,
        userId: user.uid,        // 🔒 obligatoire (rules)
        status: "pending",       // 🔒 obligatoire (modération)
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

<script type="module" src="./annonce-location.js"></script>
</body>
</html>
