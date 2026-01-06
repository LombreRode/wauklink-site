import { db } from "../shared/firebase.js";
import {
  doc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { requireUser } from "../shared/guard.js";

document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("profileForm");
  const msg = document.getElementById("msg");
  const proAccess = document.getElementById("proAccess");

  requireUser({
    redirectTo: "./login.html",

    onOk: (user, profile) => {

      // 🔹 Afficher espace prestataire si PRO
      if ((profile.role === "admin" || profile.isPro === true) && proAccess) {
        proAccess.style.display = "block";
      }

      // 🔹 Pré-remplissage
      if (profile.activity) {
        const activityInput = document.getElementById("activity");
        if (activityInput) {
          activityInput.value = profile.activity;
        }
      }

      if (profile.description) {
        const descInput = document.getElementById("description");
        if (descInput) {
          descInput.value = profile.description;
        }
      }

      // 🔹 Enregistrement
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const activity =
          document.getElementById("activity")?.value.trim();
        const description =
          document.getElementById("description")?.value.trim();

        if (!activity) {
          msg.textContent = "❌ Activité obligatoire";
          return;
        }

        try {
          await updateDoc(doc(db, "users", user.uid), {
            activity,
            description,
            updatedAt: serverTimestamp()
          });

          msg.textContent = "✅ Activité enregistrée";
        } catch (err) {
          console.error(err);
          msg.textContent = "❌ Erreur lors de l’enregistrement";
        }
      });
    }
  });
});
