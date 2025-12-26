import { requireModeration } from "./_shared/guard.js";

const msg = document.getElementById("msg");

requireModeration({
  redirectTo: "../index.html",
  onLoading: () => {
    msg.textContent = "Vérification en cours…";
  },
  onOk: (_user, role) => {
    msg.textContent = `✅ Accès autorisé • role: ${role}\nRedirection…`;
    if (role === "admin") location.replace("./index.html");
    else location.replace("./moderation.html");
  },
  onFail: (why, role) => {
    msg.textContent = `⛔ Accès refusé (${why})\nROLE: "${role || ""}"`;
  }
});
