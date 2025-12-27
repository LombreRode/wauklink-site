// /auth/status.js
import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// 🔹 GitHub Pages: détecte /nom-du-repo
function basePath() {
  const parts = location.pathname.split("/").filter(Boolean);
  return parts.length ? `/${parts[0]}` : "";
}

// 🔹 Barre UI
function ensureBar() {
  let bar = document.getElementById("authBar");
  if (bar) return bar;

  bar = document.createElement("div");
  bar.id = "authBar";
  bar.style.cssText = `
    position:fixed;
    top:12px;
    right:12px;
    z-index:9999;
    display:flex;
    gap:10px;
    align-items:center;
    padding:8px 10px;
    border-radius:14px;
    border:1px solid rgba(255,255,255,.14);
    background:rgba(0,0,0,.35);
    backdrop-filter:blur(8px);
    color:#fff;
    font-size:13px;
  `;
  document.body.appendChild(bar);
  return bar;
}

function pill(text) {
  const s = document.createElement("span");
  s.textContent = text;
  s.style.opacity = ".9";
  return s;
}

function linkBtn(label, href, style = {}) {
  const a = document.createElement("a");
  a.textContent = label;
  a.href = href;
  a.style.cssText = `
    text-decoration:none;
    color:#fff;
    border:1px solid rgba(255,255,255,.14);
    background:rgba(255,255,255,.06);
    padding:7px 10px;
    border-radius:12px;
    cursor:pointer;
  `;
  Object.assign(a.style, style);
  return a;
}

async function getRole(uid) {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? String(snap.data().role || "") : "";
  } catch (e) {
    console.error("ROLE ERROR:", e);
    return "";
  }
}

// 🚀 BOOT
(function boot() {
  const bar = ensureBar();
  const base = basePath();

  const loginUrl = `${base}/auth/login.html`;
  const adminUrl = `${base}/admin/index.html`;

  onAuthStateChanged(auth, async (user) => {
    bar.innerHTML = "";

    if (!user) {
      bar.appendChild(pill("Non connecté"));
      bar.appendChild(linkBtn("Connexion", loginUrl));
      return;
    }

    bar.appendChild(pill(user.email || "Connecté"));

    const logout = linkBtn("Déconnexion", "#", {
      borderColor: "rgba(255,80,80,.45)",
      background: "rgba(255,80,80,.12)"
    });

    logout.onclick = async (e) => {
      e.preventDefault();
      await signOut(auth);
      location.reload();
    };

    bar.appendChild(logout);

    const role = await getRole(user.uid);

    if (role === "moderator" || role === "admin") {
      bar.appendChild(
        linkBtn("Modération", adminUrl, {
          borderColor: "rgba(255,190,80,.45)",
          background: "rgba(255,190,80,.12)"
        })
      );
    }

    if (role === "admin") {
      bar.appendChild(
        linkBtn("Admin", adminUrl, {
          borderColor: "rgba(80,255,160,.35)",
          background: "rgba(80,255,160,.12)"
        })
      );
    }
  });
})();
