// shared/admin_links.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const adminLinks = document.getElementById("adminLinks");
  if (!adminLinks) return;

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      adminLinks.classList.add("hidden");
      return;
    }

    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists()) {
        adminLinks.classList.add("hidden");
        return;
      }

      const role = snap.data().role;
      if (role !== "admin" && role !== "moderator") {
        adminLinks.classList.add("hidden");
        return;
      }

      // ✅ UTILISATEUR ADMIN → AFFICHER LE MENU
      adminLinks.classList.remove("hidden");

      // 🔗 LIENS ADMIN (MENU COMPLET)
     const links = [
  // ⭐ DASHBOARD (À AJOUTER)
  { href: "/wauklink-site/admin/dashboard.html", label: "Dashboard" },

  { href: "/wauklink-site/admin/users.html", label: "Utilisateurs" },
  { href: "/wauklink-site/admin/annonces.html", label: "Annonces (en attente)" },
  { href: "/wauklink-site/admin/annonces-all.html", label: "Toutes les annonces" },
  { href: "/wauklink-site/admin/logs.html", label: "Historique admin" },
  { href: "/wauklink-site/admin/reports.html", label: "Signalements" },
  { href: "/wauklink-site/admin/pro-requests.html", label: "Comptes PRO" }
];

        // ⭐ HISTORIQUE ADMIN (CE QUI MANQUAIT)
        { href: "/wauklink-site/admin/logs.html", label: "Historique admin" },

        { href: "/wauklink-site/admin/reports.html", label: "Signalements" },
        { href: "/wauklink-site/admin/pro-requests.html", label: "Comptes PRO" }
      ];

      // Nettoyage + injection
      adminLinks.innerHTML = "";
      links.forEach(l => {
        const a = document.createElement("a");
        a.href = l.href;
        a.textContent = l.label;
        a.className = "btn btn-outline";
        adminLinks.appendChild(a);
      });

    } catch (err) {
      console.error("admin_links error:", err);
      adminLinks.classList.add("hidden");
    }
  });
});
