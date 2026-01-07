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

  // 🔒 Sécurité
  if (!form) {
    console.error("Formulaire introuvable");
    return;
  }

  requireUser({
    redirectTo: "./login.html",
    onOk: (user, profile) => {

      // =========================
      // ESPACE PRO / PRESTATAIRE
      // =========================
      if ((profile.role === "admin" || profile.isPro === true) && proAccess) {
        proAccess.style.display = "block";
      }

      // =========================
      // PRÉ-REMPLISSAGE
      // =========================
      const activityInput = document.getElementById("activity");
      const descInput = document.getElementById("description");

      if (activityInput && profile.activity) {
        activityInput.value = profile.activity;
      }

      if (descInput && profile.description) {
        descInput.value = profile.description;
      }

      // =========================
      // ENREGISTREMENT PROFIL
      // =========================
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const activity = activityInput?.value.trim();
        const description = descInput?.value.trim();

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
