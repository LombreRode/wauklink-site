// wauklink-site/admin/admin.js
import { auth, db } from "../auth/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// Chemin du repo GitHub Pages (ex: /wauklink-site)
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

function deny(msg) {
  alert(msg);
  // retour accueil
  window.location.replace(`${basePath()}/`);
}

function showMeta(text) {
  const meta = document.querySelector(".meta");
  if (meta) meta.textContent = text;
}

onAuthStateChanged(auth, async (user) => {
  // 1) pas connecté => login
  if (!user) {
    window.location.replace(`${basePath()}/auth/login.html`);
    return;
  }

  // 2) connecté => lire role
  const role = await getRole(user.uid);

  // 3) autorisation
  const isAdmin = role === "admin";
  const isModerator = role === "moderator";

  // Cette page /admin/index.html = accès admin uniquement (comme ton texte)
  if (!isAdmin) {
    deny("⛔ Accès refusé : cette page est réservée aux admins.");
    return;
  }

  // 4) Affichage info simple (optionnel)
  showMeta(`Connecté : ${user.email || "ok"} • role: ${role}`);

  // 5) (optionnel) si un jour tu veux aussi autoriser les modérateurs ici :
  // if (!(isAdmin || isModerator)) { deny("..."); return; }
});
