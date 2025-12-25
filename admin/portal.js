import { auth, db } from "../auth/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

function basePath() {
  const parts = location.pathname.split("/").filter(Boolean);
  return parts.length ? `/${parts[0]}` : "";
}

const msg = document.getElementById("msg");

async function getRole(uid) {
  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return { role: "", exists: false, error: "" };
    }

    const data = snap.data() || {};
    return { role: String(data.role || ""), exists: true, error: "" };
  } catch (e) {
    console.error("getRole error:", e);
    return { role: "", exists: false, error: String(e?.message || e) };
  }
}

onAuthStateChanged(auth, async (user) => {
  const base = basePath();

  if (!user) {
    msg.textContent = "Connexion nécessaire…";
    sessionStorage.setItem("afterLoginGo", `${base}/admin/portal.html`);
    window.location.replace(`${base}/auth/login.html`);
    return;
  }

  msg.textContent = `Connecté: ${user.email || "?"} • UID: ${user.uid}\nLecture rôle…`;

  const res = await getRole(user.uid);

  msg.textContent =
    `Connecté: ${user.email || "?"}\n` +
    `UID: ${user.uid}\n` +
    `Doc users/<uid> existe: ${res.exists ? "OUI" : "NON"}\n` +
    `role lu: "${res.role}"\n` +
    (res.error ? `ERREUR: ${res.error}\n` : "");

  if (res.role === "admin") {
    window.location.replace(`${base}/admin/index.html`);
    return;
  }

  if (res.role === "moderator") {
    window.location.replace(`${base}/admin/moderation.html`);
    return;
  }

  // reste sur la page avec le message debug
});
