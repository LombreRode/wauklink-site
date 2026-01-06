import { db } from "../shared/firebase.js";
import { requireAdmin } from "../shared/guard.js";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const list = document.getElementById("list");
const empty = document.getElementById("empty");

requireAdmin({
  redirectTo: "../auth/login.html",
  onOk: loadPending
});

async function loadPending() {
  list.innerHTML = "";

  const q = query(
    collection(db, "annonces"),
    where("status", "==", "pending")
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    empty.classList.remove("hidden");
    return;
  }

  snap.forEach(d => {
    const a = d.data();

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${a.title || "Sans titre"}</h3>
      <p>${a.description || ""}</p>
      <div class="actions">
        <button class="btn btn-ok">Valider</button>
        <button class="btn btn-danger">Refuser</button>
      </div>
    `;

    const [btnOk, btnNo] = card.querySelectorAll("button");

    btnOk.onclick = () => updateStatus(d.id, "active");
    btnNo.onclick = () => updateStatus(d.id, "refused");

    list.appendChild(card);
  });
}

async function updateStatus(id, status) {
  await updateDoc(doc(db, "annonces", id), { status });
  loadPending();
}
