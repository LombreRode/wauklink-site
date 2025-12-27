import { requireModeration } from "../_shared/guard.js";

const msg = document.getElementById("msg");

requireModeration({
  redirectTo: "../auth/login.html",
  onLoading: () => {
    msg.textContent = "Vérification du rôle…";
  },
  onOk: (_user, role) => {
    msg.textContent = `Accès autorisé (${role}) – redirection…`;
    if (role === "admin") {
      location.replace("./index.html");
    } else {
      location.replace("./moderation.html");
    }
  },
  onFail: () => {
    msg.textContent = "⛔ Accès refusé";
  }
});
