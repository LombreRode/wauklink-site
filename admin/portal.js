// admin/portal.js
import { auth, db } from "../shared/firebase.js";
import { requireAdmin } from "../shared/guard.js";

document.addEventListener("DOMContentLoaded", () => {
  const msg = document.getElementById("msg");

  if (!msg) {
    console.error("❌ admin/portal.js : élément #msg introuvable");
    return;
  }

  requireAdmin({
    redirectTo: "/wauklink-site/auth/login.html",

    onOk: (user, profile) => {
      // ✅ Accès admin validé
      msg.textContent = `✅ Accès admin autorisé (${profile.role})`;

      // Ici tu pourras charger ensuite :
      // - stats
      // - logs
      // - raccourcis admin
      console.log("👑 Admin connecté :", user.uid);
    },

    onDenied: () => {
      msg.textContent = "⛔ Accès refusé (admin requis)";
    }
  });
});
