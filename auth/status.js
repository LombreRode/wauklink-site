// /auth/status.js
import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  let box = document.getElementById("authStatus");

  // crée la box si elle n'existe pas
  if (!box) {
    box = document.createElement("div");
    box.id = "authStatus";
    document.body.appendChild(box);
  }

  // style simple et visible
  box.style.position = "fixed";
  box.style.top = "12px";
  box.style.right = "12px";
  box.style.zIndex = "9999";
  box.style.padding = "10px 12px";
  box.style.borderRadius = "12px";
  box.style.border = "1px solid rgba(255,255,255,.15)";
  box.style.background = "rgba(0,0,0,.45)";
  box.style.color = "#fff";
  box.style.fontSize = "13px";
  box.style.fontFamily = "system-ui, sans-serif";

  onAuthStateChanged(auth, (user) => {
    if (user) {
      box.innerHTML = `
        ✅ Connecté<br>
        <b>${user.email}</b><br>
        <a href="#" id="logoutBtn" style="color:#7dd3fc;text-decoration:underline">Déconnexion</a>
      `;

      document.getElementById("logoutBtn").onclick = async (e) => {
        e.preventDefault();
        await signOut(auth);
        location.reload();
      };

    } else {
      box.innerHTML = `
        ❌ Non connecté<br>
        <a href="./login.html" style="color:#7dd3fc;text-decoration:underline">Connexion</a>
        ·
        <a href="./register.html" style="color:#7dd3fc;text-decoration:underline">Inscription</a>
      `;
    }
  });
});
