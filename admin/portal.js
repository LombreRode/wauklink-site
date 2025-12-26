import { auth, db } from "../auth/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const msg = document.getElementById("msg");

async function readRole(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  const data = snap.exists() ? snap.data() : null;
  return {
    exists: snap.exists(),
    role: snap.exists() ? String(data?.role || "") : "",
    data
  };
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    msg.textContent = "NOT LOGGED";
    return;
  }

  const r = await readRole(user.uid);

  // ✅ IMPORTANT: ça affiche TOUT ce qu'il y a dans ton doc users/<uid>
  console.log("USERS DOC DATA =", r.data);

  msg.textContent =
    `EMAIL: ${user.email}\n` +
    `UID: ${user.uid}\n` +
    `USERS DOC: ${r.exists ? "YES" : "NO"}\n` +
    `ROLE: "${r.role}"\n`;

  if (r.role === "admin") location.replace("./index.html");
  else if (r.role === "moderator") location.replace("./moderation.html");
  else msg.textContent += `\n⛔ Accès refusé (pas admin/modérateur).`;
});
