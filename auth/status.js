import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// Détecte automatiquement le "prefix" GitHub Pages (ex: /wauklink-site)
function basePath() {
  const parts = location.pathname.split("/").filter(Boolean); // ["wauklink-site", "index.html", ...]
  return parts.length ? `/${parts[0]}` : "";
}

function ensureBar() {
  let bar = document.getElementById("authBar");
  if (bar) return bar;

  bar = document.createElement("div");
  bar.id = "authBar";
  bar.style.position = "fixed";
  bar.style.top = "12px";
  bar.style.right = "12px";
  bar.style.zIndex = "9999";
  bar.style.display = "flex";
  bar.style.gap = "10px";
  bar.style.alignItems = "center";
  bar.style.padding = "8px 10px";
  bar.style.borderRadius = "14px";
  bar.style.border = "1px solid rgba(255,255,255,.14)";
  bar.style.background = "rgba(0,0,0,.35)";
  bar.style.backdropFilter = "blur(8px)";
  bar.style.color = "#fff";
  bar.style.fontSize = "13px";

  document.body.appendChild(bar);
  return bar;
}

function makeLink(label, href, danger = false) {
  const a = document.createElement("a");
  a.textContent = label;
  a.href = href;
  a.style.textDecoration = "none";
  a.style.color = "#fff";
  a.style.border = "1px solid rgba(255,255,255,.14)";
  a.style.background = "rgba(255,255,255,.06)";
  a.style.padding = "7px 10px";
  a.style.borderRadius = "12px";
  a.style.cursor = "pointer";
  if (danger) {
    a.style.borderColor = "rgba(255,80,80,.45)";
    a.style.background = "rgba(255,80,80,.12)";
  }
  return a;
}

function pill(text) {
  const s = document.createElement("span");
  s.textContent = text;
  s.style.opacity = ".9";
  return s;
}

async function isAdmin(uid) {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() && snap.data()?.role === "admin";
  } catch (e) {
    console.error("isAdmin error:", e);
    return false;
  }
}

async function boot() {
  const bar = ensureBar();
  const base = basePath();

  const loginUrl = `${base}/auth/login.html`;
  const adminUrl = `${base}/admin/index.html`;

  onAuthStateChanged(auth, async (user) => {
    bar.innerHTML = "";

    if (!user) {
      bar.appendChild(pill("Non connecté"));
      bar.appendChild(makeLink("Connexion", loginUrl));
      return;
    }

    bar.appendChild(pill(user.email || "Connecté"));

    const logout = makeLink("Déconnexion", "#", true);
    logout.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await signOut(auth);
        location.reload();
      } catch (err) {
        console.error(err);
        alert("❌ Impossible de se déconnecter.");
      }
    });
    bar.appendChild(logout);

    const ok = await isAdmin(user.uid);
    if (ok) {
      // Vérifie que la page admin existe (sinon ça évite un bouton qui mène à 404)
      try {
        const r = await fetch(adminUrl, { method: "HEAD" });
        if (r.ok) bar.appendChild(makeLink("Admin", adminUrl));
        else bar.appendChild(pill("⚠️ Admin: page 404"));
      } catch {
        bar.appendChild(pill("⚠️ Admin: page 404"));
      }
    }
  });
}

boot();
