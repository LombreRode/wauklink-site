import { auth, db } from "../auth/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const msg = document.getElementById("msg");

async function readRole(uid) {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return { exists: snap.exists(), role: snap.exists() ? String(snap.data()?.role || "") : "" };
  } catch (e) {
    return { exists: false, role: "", err: String(e?.message || e) };
  }
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // ✅ pas connecté -> login + retour auto
    sessionStorage.setItem("afterLoginGo", "/wauklink-site/admin/portal.html");
    msg.textContent = "Connexion nécessaire… redirection vers login";
    location.replace("../auth/login.html");
    return;
  }

  const r = await readRole(user.uid);

  msg.textContent =
    `EMAIL: ${user.email}\n` +
    `UID: ${user.uid}\n` +
    `USERS DOC: ${r.exists ? "YES" : "NO"}\n` +
    `ROLE: "${r.role}"\n` +
    (r.err ? `ERR: ${r.err}` : "");

  if (r.role === "admin") location.replace("./index.html");
  else if (r.role === "moderator") location.replace("./moderation.html");
  else msg.textContent += `\n⛔ Accès refusé (pas admin/modérateur).`;
});
