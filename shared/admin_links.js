// shared/admin_links.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const adminLinks = document.getElementById("adminLinks");
  if (!adminLinks) return;

  adminLinks.classList.add("hidden");

  onAuthStateChanged(auth, async user => {
    if (!user) return;

    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists()) return;

      const role = snap.data().role;
      if (role !== "admin" && role !== "moderator") return;

      // ✅ Configuration des liens avec ID pour les badges
      const links = [
        { href: "/wauklink-site/admin/dashboard.html", label: "Dashboard", id: "link-dash" },
        { href: "/wauklink-site/admin/users.html", label: "Utilisateurs", id: "link-users" },
        { href: "/wauklink-site/admin/annonces.html", label: "Annonces (en attente)", id: "link-pending" },
        { href: "/wauklink-site/admin/annonces-all.html", label: "Toutes les annonces", id: "link-all" },
        { href: "/wauklink-site/admin/reports.html", label: "Signalements", id: "link-reports" },
        { href: "/wauklink-site/admin/pro-requests.html", label: "Comptes PRO", id: "link-pro" }
      ];

      adminLinks.innerHTML = "";
      links.forEach(l => {
        const a = document.createElement("a");
        a.href = l.href;
        a.id = l.id;
        a.textContent = l.label;
        a.className = "btn btn-outline";
        a.style.position = "relative"; 
        adminLinks.appendChild(a);
      });

      adminLinks.classList.remove("hidden");

      /* ==========================================================
         🔥 SYSTÈME DE BADGES EN TEMPS RÉEL
         ========================================================== */

      // Fonction pour créer/mettre à jour un badge
      const updateBadge = (linkId, count, color) => {
        const btn = document.getElementById(linkId);
        if (!btn) return;

        const oldBadge = btn.querySelector(".badge-notif");
        if (oldBadge) oldBadge.remove();

        if (count > 0) {
          const badge = document.createElement("span");
          badge.className = "badge-notif";
          badge.textContent = count;
          badge.style.cssText = `
            position: absolute; top: -8px; right: -8px;
            background: ${color}; color: white; border-radius: 50%;
            padding: 2px 6px; font-size: 11px; font-weight: bold;
            border: 2px solid white; z-index: 10;
          `;
          btn.appendChild(badge);
        }
      };

      // 1. Écouter les SIGNALEMENTS (status == open)
      const qReports = query(collection(db, "reports"), where("status", "==", "open"));
      onSnapshot(qReports, (snap) => updateBadge("link-reports", snap.size, "#ff4444"));

      // 2. Écouter les ANNONCES EN ATTENTE (status == pending)
      const qPending = query(collection(db, "annonces"), where("status", "==", "pending"));
      onSnapshot(qPending, (snap) => updateBadge("link-pending", snap.size, "#ffa500"));

    } catch (err) {
      console.error("admin_links error:", err);
      adminLinks.classList.add("hidden");
    }
  });
});
