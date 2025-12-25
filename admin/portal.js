import { auth, db } from "../auth/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

function basePath() {
  const parts = location.pathname.split("/").filter(Boolean);
  return parts.length ? `/${parts[0]}` : "";
}

const msg = document.getElementById("msg");

async function getRole(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? String(snap.data()?.role || "") : "";
}

onAuthStateChanged(auth, async (user) => {
  const base = basePath();

  if (!user) {
    msg.textContent = "Connexion nécessaire…";
    sessionStorage.setItem("afterLoginGo", `${base}/admin/portal.html`);
    window.location.replace(`${base}/auth/login.html`);
    return;
  }

  msg.textContent = "Vérification du rôle…";
  const role = await getRole(user.uid);

  if (role === "admin") {
    window.location.replace(`${base}/admin/index.html`);
    return;
  }

  if (role === "moderator") {
    window.location.replace(`${base}/admin/moderation.html`);
    return;
  }

  msg.textContent = "⛔ Accès refusé (pas admin/modérateur).";
});
