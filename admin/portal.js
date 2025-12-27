import { requireModeration } from "../_shared/guard.js";

const msg = document.getElementById("msg");

requireModeration({
  redirectTo: "../auth/login.html",

  onLoading: () => {
    msg.textContent = "Vérification en cours…";
  },

  onOk: (_user, role) => {
    msg.textContent = `✅ Accès autorisé • rôle : ${role}\nRedirection…`;

    if (role === "admin") {
      location.replace("./index.html");
    } else {
      location.replace("./moderation.html");
    }
  },

  onFail: (why, role) => {
    msg.textContent = `⛔ Accès refusé (${why})\nRôle : ${role || "aucun"}`;
  }
});
