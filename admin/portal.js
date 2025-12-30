// admin/portal.js
import { requireAdmin } from "/wauklink-site/shared/guard.js";

const msg = document.getElementById("msg");

requireAdmin({
  redirectTo: "/wauklink-site/auth/login.html",
  onOk: () => {
    msg.textContent = "Accès admin autorisé";
  }
});
