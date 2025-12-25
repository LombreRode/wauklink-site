// auth/status.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// GitHub Pages : récupère le nom du repo (ex: /wauklink-site)
function basePath() {
  const parts = location.pathname.split("/").filter(Boolean);
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

function linkBtn(label, href, style = {}) {
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

async function getRole(uid) {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return "";
    return String(snap.data()?.role || "");
  } catch (e) {
    console.error("getRole error:", e);
    return "";
  }
}

(async function boot() {
  const bar = ensureBar();
  const base = basePath();

  const loginUrl = `${base}/auth/login.html`;
  const adminUrl = `${base}/admin/index.html`;
  const modUrl = `${base}/admin/index.html`; // même dashboard, filtré par rules

  onAuthStateChanged(auth, async (user) => {
    bar.innerHTML = "";

    // ❌ Pas connecté
    if (!user) {
      bar.appendChild(pill("Non connecté"));
      bar.appendChild(linkBtn("Connexion", loginUrl));
      return;
    }

    // ✅ Connecté
    bar.appendChild(pill(user.email || "Connecté"));

    const logout = linkBtn("Déconnexion", "#", {
      borderColor: "rgba(255,80,80,.45)",
      background: "rgba(255,80,80,.12)",
    });

    logout.addEventListener("click", async (e) => {
      e.preventDefault();
      await signOut(auth);
      location.reload();
    });

    bar.appendChild(logout);

    // 🔐 Rôle
    const role = await getRole(user.uid);

    // 🟡 Moderator OU Admin
    if (role === "moderator" || role === "admin") {
      bar.appendChild(
        linkBtn("Modération", modUrl, {
          borderColor: "rgba(255,190,80,.45)",
          background: "rgba(255,190,80,.12)",
        })
      );
    }

    // 🟢 Admin uniquement
    if (role === "admin") {
      bar.appendChild(
        linkBtn("Admin", adminUrl, {
          borderColor: "rgba(80,255,160,.35)",
          background: "rgba(80,255,160,.12)",
        })
      );
    }
  });
})();
