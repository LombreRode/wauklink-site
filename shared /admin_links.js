// shared/admin_links.js
import { auth, db } from "/shared/firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const adminLinks = document.getElementById("adminLinks");

  // Si la page n’a pas de liens admin → on ne fait rien
  if (!adminLinks) return;

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      adminLinks.classList.add("hidden");
      return;
    }

    try {
      const snap = await getDoc(doc(db, "users", user.uid));

      if (!snap.exists()) {
        adminLinks.classList.add("hidden");
        return;
      }

      const role = snap.data().role;

      if (role === "admin" || role === "moderator") {
        adminLinks.classList.remove("hidden");
      } else {
        adminLinks.classList.add("hidden");
      }

    } catch (err) {
      console.error("admin_links error:", err);
      adminLinks.classList.add("hidden");
    }
  });
});
