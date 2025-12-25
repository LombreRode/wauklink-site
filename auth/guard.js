// WAUKLINK/auth/guard.js
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// GitHub Pages: récupère le nom du repo dans l'URL (ex: /wauklink-site)
function basePath() {
  const parts = location.pathname.split("/").filter(Boolean);
  return parts.length ? `/${parts[0]}` : "";
}

// 🔒 vérifie si connecté (pour le carrousel)
export function isAuthed(callback) {
  onAuthStateChanged(auth, (user) => {
    callback(!!user, user || null);
  });
}

// 🔒 protège une page complète
export function requireAuth() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.replace(`${basePath()}/auth/login.html`);
        return;
      }
      resolve(user);
    });
  });
}
