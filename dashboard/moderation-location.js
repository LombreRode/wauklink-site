import { db } from "../shared/firebase.js";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const list = document.getElementById("pendingList");

if (!list) {
  console.error("Liste admin introuvable");
}

const q = query(
  collection(db, "annonces"),
  where("status", "==", "pending")
);

onSnapshot(q, (snapshot) => {
  list.innerHTML = "";

  if (snapshot.empty) {
    list.innerHTML = "<p>Aucune annonce à modérer</p>";
    return;
  }

  snapshot.forEach((docSnap) => {
    const a = docSnap.data();

    const div = document.createElement("div");
    div.className = "admin-card";

    div.innerHTML = `
      <h3>${a.title}</h3>
      <p><strong>Ville :</strong> ${a.city}</p>
      <p><strong>Type :</strong> ${a.type}</p>

      <button class="btn-validate">Valider</button>
      <button class="btn-refuse">Refuser</button>
    `;

    // ✅ VALIDER
    div.querySelector(".btn-validate").onclick = async () => {
      await updateDoc(doc(db, "annonces", docSnap.id), {
        status: "active",
        validatedAt: serverTimestamp()
      });
    };

    // ❌ REFUSER
    div.querySelector(".btn-refuse").onclick = async () => {
      await updateDoc(doc(db, "annonces", docSnap.id), {
        status: "refused",
        refusedAt: serverTimestamp()
      });
    };

    list.appendChild(div);
  });
});
