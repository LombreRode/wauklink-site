// wauklink-site/admin/admin.js?v=2
import { auth, db } from "../auth/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

function basePath() {
  const parts = location.pathname.split("/").filter(Boolean);
  return parts.length ? `/${parts[0]}` : "";
}

async function getRole(uid) {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? String(snap.data()?.role || "") : "";
  } catch (e) {
    console.error("getRole error:", e);
    return "";
  }
}

function setMeta(text) {
  const el = document.getElementById("adminMeta");
  if (el) el.textContent = text;
}

function hideByRole(role) {
  const cards = document.querySelectorAll("[data-minrole]");
  cards.forEach((card) => {
    const min = card.getAttribute("data-minrole"); // "admin" ou "moderator"
    const ok =
      (min === "admin" && role === "admin") ||
      (min === "moderator" && (role === "admin" || role === "moderator"));

    card.classList.toggle("hidden", !ok);
  });
}

function deny(msg) {
  alert(msg);
  window.location.replace(`${basePath()}/`);
}

onAuthStateChanged(auth, async (user) => {
  const base = basePath();

  // Pas connecté => login
  if (!user) {
    window.location.replace(`${base}/auth/login.html`);
    return;
  }

  // Connecté => rôle
  const role = await getRole(user.uid);

  // Admin OU Moderator autorisés à entrer sur cette page
  if (!(role === "admin" || role === "moderator")) {
    deny("⛔ Accès refusé : réservé admin/modérateur.");
    return;
  }

  // Appliquer restrictions UI
  setMeta(`Connecté : ${user.email || "ok"} • role: ${role}`);
  hideByRole(role);
});
