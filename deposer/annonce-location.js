import { auth, db } from "../shared/firebase.js";
import { requireUser } from "../shared/guard.js";
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

/* 🔐 Sécurité (HTML clean) */
requireUser();

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

/* ===== Sécurité DOM ===== */
if (!form) {
  console.error("❌ Formulaire introuvable");
  throw new Error("Form missing");
}

/* ===== Messages par type ===== */
const typeMessages = {
  immobilier: "🏠 Immobilier",
  loisir: "🎯 Loisirs",
  autres: "📦 Autre location",
  "services-personne": "🤝 Services à la personne",
  travaux: "🛠️ Travaux",
  urgences: "🚨 Urgences"
};

typeEl.addEventListener("change", () => {
  if (typeInfo) {
    typeInfo.textContent = typeMessages[typeEl.value] || "";
  }
});

/* ===== Auth + droits ===== */
let submitInit = false;

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return;

  const { role, plan } = snap.data();

  // ✅ Admin
  if (role === "admin") {
    form.classList.remove("hidden");
    planBlock.classList.add("hidden");
    initSubmit(user);
    return;
  }

  // ❌ Gratuit
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
    if (msg) msg.textContent = "";

    const title = titleEl.value.trim();
    const city  = cityEl.value.trim();
    const phone = phoneEl.value.trim();
    const postalCode = postalEl.value.trim();
    const description = descEl.value.trim();
    const type = typeEl.value;
    const price = priceEl.value ? Number(priceEl.value) : null;

    if (!title || !city || !phone || !postalCode || !description || !type) {
      if (msg) msg.textContent = "❌ Tous les champs obligatoires doivent être remplis";
      return;
    }

    if (msg) msg.textContent = "⏳ Publication en cours…";

    try {
      await addDoc(collection(db, "annonces"), {
        title,
        city,
        phone,
        postalCode,
        description,
        type,
        price,
        userId: user.uid,   // ✅ COMPATIBLE RULES
        status: "pending",
        createdAt: serverTimestamp()
      });

      if (msg) msg.textContent = "✅ Annonce publiée";
      form.reset();
      if (typeInfo) typeInfo.textContent = "";

      setTimeout(() => {
        location.href = "../dashboard/index.html";
      }, 800);

    } catch (err) {
      console.error(err);
      if (msg) msg.textContent = "❌ Erreur lors de la publication";
    }
  });
}
