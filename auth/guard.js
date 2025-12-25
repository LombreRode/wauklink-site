// WAUKLINK/auth/guard.js
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

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
        // ✅ chemin ABSOLU correct GitHub Pages
        window.location.replace("/WAUKLINK/auth/login.html");
        return;
      }
      resolve(user);
    });
  });
}
