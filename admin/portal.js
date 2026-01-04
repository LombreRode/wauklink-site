// admin/portal.js
import { auth, db } from "../shared/firebase.js";

document.addEventListener("DOMContentLoaded", () => {
  const msg = document.getElementById("msg");

  if (!msg) {
    console.error("❌ Élément #msg introuvable");
    return;
  }

  requireAdmin({
    redirectTo: "/wauklink-site/auth/login.html",
    onOk: (user, profile) => {
      // Accès admin validé
      msg.textContent = `✅ Accès admin autorisé (${profile.role})`;

      // Ici tu peux charger :
      // - stats
      // - utilisateurs
      // - modération
    }
  });
});
