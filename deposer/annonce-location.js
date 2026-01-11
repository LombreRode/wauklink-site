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

/* ===== Message selon rubrique ===== */
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
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return;

  const { role, plan } = snap.data();

  // ✅ ADMIN = ACCÈS TOTAL
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

/* ===== Submit annonce ===== */
function initSubmit(user) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const data = {
      title: document.getElementById("title").value.trim(),
      city: document.getElementById("city").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      postalCode: document.getElementById("postalCode").value.trim(),
      type: typeSelect.value,
      price: Number(document.getElementById("price").value),
      description: document.getElementById("description").value.trim()
    };

    if (Object.values(data).some(v => !v)) {
      msg.textContent = "❌ Tous les champs sont obligatoires.";
      return;
    }

    try {
      await addDoc(collection(db, "annonces"), {
        ...data,
        ownerUid: user.uid,
        status: "pending",
        createdAt: serverTimestamp()
      });

      msg.textContent = "✅ Annonce publiée avec succès";
      form.reset();
      typeInfo.textContent = "";
    } catch (err) {
      console.error(err);
      msg.textContent = "❌ Erreur lors de la publication.";
    }
  });
}
