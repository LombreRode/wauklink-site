// auth/status.js
import { auth } from "../shared/firebase.js";

import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (user) {
    document.body.classList.add("user-logged");
    window.isAuthenticated = true;
    window.authUser = user;
  } else {
    document.body.classList.remove("user-logged");
    window.isAuthenticated = false;
    window.authUser = null;
  }
});
