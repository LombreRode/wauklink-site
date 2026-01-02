// shared/admin_links.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const adminLinks = document.getElementById("adminLinks");

if (!adminLinks) {
  console.warn("adminLinks introuvable dans le HTML");
}

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return;

  const role = snap.data().role;

  if (role === "admin" || role === "moderator") {
    adminLinks.classList.remove("hidden");
  }
});
