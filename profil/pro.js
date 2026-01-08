import { auth, db } from "/wauklink-site/shared/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const proAction = document.getElementById("proAction");

console.log("✅ pro.js chargé");

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  // sécurité HTML
  if (!proAction) {
    console.error("❌ #proAction introuvable");
    return;
  }

  proAction.innerHTML = "";

  // 🔥 USER DOC
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    console.error("❌ users/{uid} inexistant");
    proAction.textContent = "❌ Profil utilisateur manquant";
    return;
  }

  const data = snap.data();

  // 👑 ADMIN → PAS DE PRO
  if (data.role === "admin") {
    proAction.textContent = "👑 Administrateur";
    return;
  }

  // 🟢 DÉJÀ PRO
  if (data.isPro === true) {
    proAction.textContent = "🟢 Compte PRO actif";
    return;
  }

  // ⏳ DEMANDE EN COURS ?
  const q = query(
    collection(db, "pro_requests"),
    where("userId", "==", user.uid),
    where("status", "==", "pending")
  );

  const reqSnap = await getDocs(q);

  if (!reqSnap.empty) {
    proAction.textContent = "⏳ Demande PRO en attente";
    return;
  }

  // 🚀 BOUTON PASSER PRO
  const btn = document.createElement("button");
  btn.textContent = "🚀 Passer en compte PRO";
  btn.className = "btn btn-ok";

  btn.onclick = async () => {
    btn.disabled = true;

    await addDoc(collection(db, "pro_requests"), {
      userId: user.uid,
      status: "pending",
      createdAt: serverTimestamp()
    });

    proAction.textContent = "⏳ Demande PRO envoyée";
  };

  proAction.appendChild(btn);
});
