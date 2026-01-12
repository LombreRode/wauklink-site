// admin/portal.js
import { auth } from "../shared/firebase.js";
import { requireAdmin } from "../shared/guard.js";

document.addEventListener("DOMContentLoaded", () => {
  const msg = document.getElementById("msg");

  if (!msg) {
    console.error("❌ admin/portal.js : élément #msg introuvable");
    return;
  }

  requireAdmin({
    onOk: (user, profile) => {
      msg.textContent =
        `✅ Accès admin autorisé (${profile.role})`;
      console.log("👑 Admin connecté :", user.uid);
      // futur :
      // - stats
      // - raccourcis
      // - widgets admin
    },
    onDenied: () => {
      msg.textContent = "⛔ Accès refusé (admin requis)";
    }
  });
});
