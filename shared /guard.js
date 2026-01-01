// shared/guard.js
import { auth, db } from "/wauklink-site/shared/firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const msg = document.getElementById("msg");

  if (!form) {
    console.error("Formulaire loginForm introuvable");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "Connexion…";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      msg.textContent = "Connecté";
      setTimeout(() => {
        location.href = "/wauklink-site/index.html";
      }, 500);
    } catch (err) {
      console.error(err);
      msg.textContent = "Email ou mot de passe incorrect";
    }
  });
});

import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import { doc, getDoc } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* =========================
   AUTH SIMPLE (connecté)
========================= */
export function requireAuth({ redirectTo }) {
  const unsub = onAuthStateChanged(auth, (user) => {
    unsub();
    if (!user) {
      location.replace(redirectTo);
    }
  });
}

/* =========================
   USER (profil Firestore requis)
========================= */
export function requireUser({ redirectTo, onOk }) {
  const unsub = onAuthStateChanged(auth, async (user) => {
    unsub();
    if (!user) {
      location.replace(redirectTo);
      return;
    }
    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) {
      location.replace(redirectTo);
      return;
    }
    onOk?.(user, snap.data());
  });
}

/* =========================
   ADMIN
========================= */
export function requireAdmin({ redirectTo, onOk }) {
  const unsub = onAuthStateChanged(auth, async (user) => {
    unsub();
    if (!user) {
      location.replace(redirectTo);
      return;
    }
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists()) {
        location.replace(redirectTo);
        return;
      }
      if (snap.data().role === "admin") {
        onOk?.(user, snap.data());
      } else {
        location.replace(redirectTo);
      }
    } catch (err) {
      console.error("Guard admin error:", err);
      location.replace(redirectTo);
    }
  });
}

/* =========================
   MODERATOR (admin OU moderator)
========================= */
export function requireModerator({ redirectTo, onOk }) {
  const unsub = onAuthStateChanged(auth, async (user) => {
    unsub();
    if (!user) {
      location.replace(redirectTo);
      return;
    }
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists()) {
        location.replace(redirectTo);
        return;
      }
      const role = snap.data().role;
      if (role === "admin" || role === "moderator") {
        onOk?.(user, snap.data());
      } else {
        location.replace(redirectTo);
      }
    } catch (err) {
      console.error("Guard moderator error:", err);
      location.replace(redirectTo);
    }
  });
}
