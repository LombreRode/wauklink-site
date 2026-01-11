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

/* ===== Éléments ===== */
const form = document.getElementById("annonceForm");
const msg  = document.getElementById("msg");
const planBlock = document.getElementById("planBlock");

const titleEl = document.getElementById("title");
const cityEl  = document.getElementById("city");
const phoneEl = document.getElementById("phone");
const postalEl = document.getElementById("postalCode");
const typeEl  = document.getElementById("type");
const priceEl = document.getElementById("price");
const descEl  = document.getElementById("description");

const typeInfo = document.getElementById("typeInfo");

/* ===== Sécurité ===== */
if (!form) {
  console.error("❌ Formulaire introuvable");
  throw new Error("Form missing");
}

/* ===== Messages par type (ALIGNÉS HTML) ===== */
const typeMessages = {
  immobilier: "🏠 Cette annonce sera publiée dans Immobilier",
  loisir: "🎯 Cette annonce sera publiée dans Loisirs",
  autres: "📦 Cette annonce sera publiée dans Autres",
  "services-personne": "🤝 Services à la personne",
  travaux: "🛠️ Travaux",
  urgences: "🚨 Urgences"
};

typeEl.addEventListener("change", () => {
  typeInfo.textContent = typeMessages[typeEl.value] || "";
});

/* ===== Auth + droits ===== */
let submitInit = false;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = "../auth/login.html";
    return;
  }

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return;

  const { role, plan } = snap.data();

  // ✅ Admin : accès total
  if (role === "admin") {
    form.classList.remove("hidden");
    planBlock.classList.add("hidden");
    initSubmit(user);
    return;
  }

  // ❌ Gratuit : bloqué
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

/* ===== Submit ===== */
function initSubmit(user) {
  if (submitInit) return;
  submitInit = true;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const title = titleEl.value.trim();
    const city  = cityEl.value.trim();
    const phone = phoneEl.value.trim();
    const postalCode = postalEl.value.trim();
    const description = descEl.value.trim();
    const type = typeEl.value;
    const price = priceEl.value ? Number(priceEl.value) : null;

    if (!title || !city || !phone || !postalCode || !description || !type) {
      msg.textContent = "❌ Tous les champs obligatoires doivent être remplis";
      return;
    }

    msg.textContent = "⏳ Publication en cours…";

    try {
      await addDoc(collection(db, "annonces"), {
        title,
        city,
        phone,
        postalCode,
        description,
        type,               // ✅ CLÉ UNIQUE
        price,
        ownerUid: user.uid,
        status: "active",   // 🔁 passer à "pending" si modération
        createdAt: serverTimestamp()
      });

      msg.textContent = "✅ Annonce publiée";
      form.reset();
      typeInfo.textContent = "";

      setTimeout(() => {
        location.href = "../dashboard/index.html";
      }, 800);

    } catch (err) {
      console.error(err);
      msg.textContent = "❌ Erreur lors de la publication";
    }
  });
}
