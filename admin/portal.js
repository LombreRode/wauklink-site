// admin/portal.js
import { auth } from "../shared/firebase.js";

const msg = document.getElementById("msg");

requireAdmin({
  redirectTo: "/wauklink-site/auth/login.html",
  onOk: () => {
    msg.textContent = "Accès admin autorisé";
  }
});
