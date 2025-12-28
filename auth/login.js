// auth/status.js
import { auth } from "../_shared/firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  const btnLogin  = document.querySelector("[data-login]");
  const btnLogout = document.querySelector("[data-logout]");

  if (user) {
    if (btnLogin)  btnLogin.style.display = "none";
    if (btnLogout) btnLogout.style.display = "inline-block";
  } else {
    if (btnLogin)  btnLogin.style.display = "inline-block";
    if (btnLogout) btnLogout.style.display = "none";
  }
});

document.addEventListener("click", async (e) => {
  if (e.target.matches("[data-logout]")) {
    await signOut(auth);
    window.location.href = "/index.html";
  }
});
