import { auth, db } from "../shared/firebase.js";
import {
  doc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("profileForm");
  const msg  = document.getElementById("msg");

  if (!form || !msg) {
    console.error("❌ Formulaire ou message introuvable");
    return;
  }

  // 🔐 SÉCURITÉ CENTRALISÉE
  import { requireUser } from "../shared/guard.js";
    redirectTo: "./login.html";
    onOk: (user, profile) => {

      // (optionnel) pré-remplir le formulaire
      if (profile.activity) {
        const activityInput = document.getElementById("activity");
        if (activityInput) activityInput.value = profile.activity;
      }

      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const activity = document.getElementById("activity")?.value.trim();
        if (!activity) {
          msg.textContent = "❌ Activité obligatoire";
          return;
        }

        try {
          await updateDoc(doc(db, "users", user.uid), {
            activity,
            updatedAt: serverTimestamp()
          });

          msg.textContent = "✅ Activité enregistrée";
        } catch (err) {
          console.error("❌ Erreur profile :", err);
          msg.textContent = "❌ Erreur lors de l’enregistrement";
        }
      });
    }
  });
});
