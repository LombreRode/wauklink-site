// admin/portal.js
import { requireModeration } from "../_shared/guard.js";

const msg = document.getElementById("msg");

msg.textContent = "Vérification des droits…";

requireModeration({
  redirectTo: "../auth/login.html",
  onOk: (user) => {
    msg.textContent = "Accès autorisé";

    // Ici tu peux rediriger selon ton besoin
    // Exemple simple :
    location.replace("./index.html");
  }
});
