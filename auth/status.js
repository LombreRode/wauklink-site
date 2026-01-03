// auth/status.js
import { auth } from "/wauklink-site/shared/firebase.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      document.body.classList.add("user-logged");
      window.isAuthenticated = true;
    } else {
      document.body.classList.remove("user-logged");
      window.isAuthenticated = false;
    }
  });
});
