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
  console.error("❌ Formulaire annonce introuvable");
  throw new Error("Form missing");
}

/* ===== Messages par type ===== */
const typeMessages = {
  urgences: "🚨 Cette annonce sera publiée dans Urgences",
  travaux: "🛠️ Cette annonce sera publiée dans Travaux",
  location: "🏠 Cette annonce sera publiée dans Locations",
  emploi: "💼 Cette annonce sera publiée dans Emploi",
  "services-personne": "🤝 Services à la personne",
  prestataire: "🧰 Prestataires / Pro"
};

typeSelect?.addEventListener("change", () => {
  typeInfo.textContent = typeMessages[typeSelect.value] || "";
});

/* ===== Auth + droits ===== */
let submitInit = false;

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return;

  const { role, plan } = snap.data();

  // ✅ ADMIN = accès total
  if (role === "admin") {
    form.classList.remove("hidden");
    planBlock.classList.add("hidden");
    initSubmit(user);
    return;
  }

  // ❌ Gratuit = bloqué
  if (!plan || plan === "gratuit") {
    form.classList.add("hidden");
    planBlock.classList.remove("hidden");
    return;
  }

  // ✅ Particulier / Pro
  form.classList.remove("hidden");
  planBlock.classList.add("hidden");
  initSubmit(user);
});

/* ===== Submit sécurisé ===== */
function initSubmit(user) {
  if (submitInit) return;
  submitInit = true;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const title = document.getElementById("title")?.value.trim();
    const city  = document.getElementById("city")?.value.trim();
    const phone = document.getElementById("phone")?.value.trim();
    const postalCode = document.getElementById("postalCode")?.value.trim();
    const description = document.getElementById("description")?.value.trim();
    const type = typeSelect.value;

    const priceRaw = document.getElementById("price")?.value;
    const price = priceRaw ? Number(priceRaw) : null;

    if (!type) {
      msg.textContent = "❌ Veuillez choisir une catégorie.";
      return;
    }

    if (!title || !city || !phone || !postalCode || !description) {
      msg.textContent = "❌ Tous les champs sont obligatoires.";
      return;
    }

    try {
      await addDoc(collection(db, "annonces"), {
        title,
        city,
        phone,
        postalCode,
        description,
        type,
        price,
        ownerUid: user.uid,
        status: "pending",
        createdAt: serverTimestamp()
      });

      msg.textContent = "✅ Annonce publiée avec succès";
      form.reset();
      typeInfo.textContent = "";

    } catch (err) {
      console.error("Annonce create error:", err);
      msg.textContent = "❌ Erreur lors de la publication.";
    }
  });
}
