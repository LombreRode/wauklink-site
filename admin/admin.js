import { requireAdmin } from "../_shared/guard.js";

requireAdmin({
  redirectTo: "../index.html",
  onOk: () => {
    console.log("ADMIN OK");
  }
});
