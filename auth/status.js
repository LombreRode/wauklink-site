// auth/status.js
// ================================
// GLOBAL AUTH STATUS BAR (APP SAFE)
// ================================

import { auth } from "../_shared/firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

/**
 * Create or return the auth bar container
 */
function getAuthBar() {
  let bar = document.getElementById("authBar");
  if (bar) return bar;

  bar = document.createElement("div");
  bar.id = "authBar";
  bar.style.cssText = `
    position:fixed;
    top:12px;
    right:12px;
    z-index:9999;
    display:flex;
    gap:10px;
    align-items:center;
    font-size:13px;
  `;
  document.body.appendChild(bar);
  return bar;
}

/**
 * Render UI depending on auth state
 */
function renderAuth(user) {
  const bar = getAuthBar();
  bar.innerHTML = "";

  if (!user) {
    const login = document.createElement("a");
    login.href = "auth/login.html"; // ✅ chemin relatif
    login.textContent = "Connexion";
    bar.appendChild(login);
    return;
  }

  const email = document.createElement("span");
  email.textContent = user.email || "Utilisateur";

  const logout = document.createElement("button");
  logout.textContent = "Déconnexion";
  logout.onclick = async () => {
    await signOut(auth);
    // ✅ retour propre sans reload violent
    window.location.href = "index.html";
  };

  bar.append(email, logout);
}

/**
 * Bootstrap auth status
 */
onAuthStateChanged(auth, renderAuth);
