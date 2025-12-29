import { requireModeration } from "../_shared/guard.js";

requireModeration({
  redirectTo: "../auth/login.html",
  onOk: () => location.replace("./index.html")
});
