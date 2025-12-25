import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// Ce script affiche l'état de connexion + ajoute un bouton Admin si role=admin
// Il essaye de se brancher sur une zone existante dans ta page.
// Si aucune zone n'existe, il crée une petite barre en haut à droite.

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

function btn(label, href, style = {}) {
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
  Object.assign(a.style, style);
  return a;
}

function pill(text) {
  const s = document.createElement("span");
  s.textContent = text;
  s.style.opacity = ".9";
  return s;
}

async function isAdminUser(uid) {
  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    return snap.exists() && snap.data()?.role === "admin";
  } catch (e) {
    console.error("isAdminUser error:", e);
    return false;
  }
}

async function boot() {
  const bar = ensureBar();

  // base links
  const loginLink = btn("Connexion", "/wauklink-site/auth/login.html");
  const logoutLink = btn("Déconnexion", "#", { borderColor: "rgba(255,80,80,.45)", background: "rgba(255,80,80,.12)" });
  const adminLink = btn("Admin", "/wauklink-site/admin/index.html", { borderColor: "rgba(80,255,160,.35)", background: "rgba(80,255,160,.12)" });

  logoutLink.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await auth.signOut();
      location.reload();
    } catch (err) {
      console.error(err);
      alert("❌ Impossible de se déconnecter.");
    }
  });

  onAuthStateChanged(auth, async (user) => {
    bar.innerHTML = "";

    if (!user) {
      bar.appendChild(pill("Non connecté"));
      bar.appendChild(loginLink);
      return;
    }

    bar.appendChild(pill(user.email || "Connecté"));
    bar.appendChild(logoutLink);

    // Admin uniquement
    const ok = await isAdminUser(user.uid);
    if (ok) {
      // petit test: si la page admin n'existe pas => on avertit
      try {
        const r = await fetch("/wauklink-site/admin/index.html", { method: "HEAD" });
        if (r.ok) bar.appendChild(adminLink);
        else bar.appendChild(pill("⚠️ Admin: page 404"));
      } catch {
        bar.appendChild(pill("⚠️ Admin: page 404"));
      }
    }
  });
}

boot();
