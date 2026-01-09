import { auth, db } from "../shared/firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc
} from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const form = document.getElementById("annonceForm");
const msg  = document.getElementById("msg");
const planBlock = document.getElementById("planBlock");

const typeSelect = document.getElementById("type");
const typeInfo   = document.getElementById("typeInfo");

if (!form) {
  console.error("Formulaire annonce introuvable");
}

/* =========================
   MESSAGE SELON RUBRIQUE
========================= */
if (typeSelect && typeInfo) {
  typeSelect.addEventListener("change", () => {
    const map = {
      urgences: "🚨 Cette annonce sera publiée dans la rubrique Urgences",
      travaux: "🛠️ Cette annonce sera publiée dans la rubrique Travaux",
      location: "🏠 Cette annonce sera publiée dans la rubrique Locations",
      emploi: "💼 Cette annonce sera publiée dans la rubrique Emploi",
      "services-personne": "🤝 Cette annonce sera publiée dans Services à la personne",
      prestataire: "🧰 Cette annonce sera publiée dans Prestataires / Pro"
    };
    typeInfo.textContent = map[typeSelect.value] || "";
  });
}

/* =========================
   AUTH + PLAN UTILISATEUR
========================= */
onAuthStateChanged(auth, async (user) => {
  if (!user || !form) return;

  const userSnap = await getDoc(doc(db, "users", user.uid));
  if (!userSnap.exists()) return;

  const { plan } = userSnap.data();

  // 🚫 Gratuit → blocage
  if (!plan || plan === "gratuit") {
    form.classList.add("hidden");
    planBlock?.classList.remove("hidden");
    return;
  }

  /* =========================
     SUBMIT ANNONCE
  ========================= */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const title = document.getElementById("title")?.value.trim();
    const city = document.getElementById("city")?.value.trim();
    const phone = document.getElementById("phone")?.value.trim();
    const postalCode = document.getElementById("postalCode")?.value.trim();
    const type = typeSelect?.value;
    const price = Number(document.getElementById("price")?.value);
    const description = document.getElementById("description")?.value.trim();

    if (!title || !city || !type || !description || !phone || !postalCode) {
      msg.textContent =
        "Tous les champs sont obligatoires (téléphone et code postal inclus).";
      return;
    }

    try {
      await addDoc(collection(db, "annonces_location"), {
        title,
        city,
        postalCode,
        phone,
        type,
        price,
        description,
        ownerUid: user.uid,
        status: "pending",
        createdAt: serverTimestamp()
      });

      msg.textContent = "Annonce publiée avec succès 🎉";
      form.reset();
      typeInfo.textContent = "";

    } catch (err) {
      console.error(err);
      msg.textContent = "Erreur lors de la publication.";
    }
  });
});
