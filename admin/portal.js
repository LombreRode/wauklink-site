// admin/portal.js
import { requireAdmin } from "/wauklink-site/shared/guard.js";

const status = document.getElementById("status");

requireAdmin({
  redirectTo: "/wauklink-site/auth/login.html",
  onOk: (user) => {
    console.log("ADMIN OK", user.uid);
    status.textContent = "Accès admin autorisé";
  }
});
