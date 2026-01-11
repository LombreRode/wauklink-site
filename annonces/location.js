import { auth, db } from "../shared/firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const titleEl = document.getElementById("title");
const descEl  = document.getElementById("description");
const cityEl  = document.getElementById("city");
const priceEl = document.getElementById("price");
const typeEl  = document.getElementById("type");
const msgEl   = document.getElementById("msg");
const btn     = document.getElementById("publishBtn");

let currentUser = null;

onAuthStateChanged(auth, user => {
  if (!user) {
    location.href = "../auth/login.html";
    return;
  }
  currentUser = user;
});

btn.onclick = async () => {
  const title = titleEl.value.trim();
  const description = descEl.value.trim();
  const city = cityEl.value.trim();
  const price = priceEl.value ? Number(priceEl.value) : null;
  const type = typeEl.value;

  if (!title || !description || !city || !type) {
    msgEl.textContent = "❌ Tous les champs obligatoires doivent être remplis";
    return;
  }

  btn.disabled = true;
  msgEl.textContent = "⏳ Publication en cours…";

  try {
    await addDoc(collection(db, "annonces"), {
      title,
      description,
      city,
      price,
      type,                // ✅ LA VENTILATION
      status: "active",
      userId: currentUser.uid,
      createdAt: serverTimestamp()
    });

    msgEl.textContent = "✅ Annonce publiée";
    setTimeout(() => {
      location.href = "../dashboard/index.html";
    }, 800);

  } catch (e) {
    console.error(e);
    msgEl.textContent = "❌ Erreur lors de la publication";
    btn.disabled = false;
  }
};
