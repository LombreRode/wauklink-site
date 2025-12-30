// admin/portal.js
import { requireAdmin } from "../shared/guard.js";

const status = document.getElementById("status");

requireAdmin({
  redirectTo: "../auth/login.html",
  onOk: (user) => {
    console.log("ADMIN OK", user.uid);
    status.textContent = "Accès admin autorisé";
  }
});
