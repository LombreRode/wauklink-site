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

      // ✅ Configuration des liens
      const links = [
        { href: "/wauklink-site/admin/dashboard.html", label: "Dashboard", id: "link-dash" },
        { href: "/wauklink-site/admin/users.html", label: "Utilisateurs", id: "link-users" },
        { href: "/wauklink-site/admin/annonces.html", label: "Annonces (en attente)", id: "link-pending" },
        { href: "/wauklink-site/admin/annonces-all.html", label: "Toutes les annonces", id: "link-all" },
        { href: "/wauklink-site/admin/logs.html", label: "Historique admin", id: "link-logs" },
        { href: "/wauklink-site/admin/reports.html", label: "Signalements", id: "link-reports" }, // On lui donne un ID
        { href: "/wauklink-site/admin/pro-requests.html", label: "Comptes PRO", id: "link-pro" }
      ];

      adminLinks.innerHTML = "";
      links.forEach(l => {
        const a = document.createElement("a");
        a.href = l.href;
        a.id = l.id;
        a.textContent = l.label;
        a.className = "btn btn-outline";
        a.style.position = "relative"; // Pour positionner le badge
        adminLinks.appendChild(a);
      });

      adminLinks.classList.remove("hidden");

      // 🔥 AMÉLIORATION : Compteur de signalements en temps réel
      const qReports = query(collection(db, "reports"), where("status", "==", "open"));
      
      onSnapshot(qReports, (snapshot) => {
        const count = snapshot.size;
        const reportBtn = document.getElementById("link-reports");
        
        // Supprimer l'ancien badge s'il existe
        const oldBadge = reportBtn.querySelector(".badge-notif");
        if (oldBadge) oldBadge.remove();

        // Si il y a des signalements, on ajoute le badge rouge
        if (count > 0) {
          const badge = document.createElement("span");
          badge.className = "badge-notif";
          badge.textContent = count;
          badge.style.cssText = `
            position: absolute;
            top: -8px;
            right: -8px;
            background: #ff4444;
            color: white;
            border-radius: 50%;
            padding: 2px 6px;
            font-size: 11px;
            font-weight: bold;
            border: 2px solid white;
          `;
          reportBtn.appendChild(badge);
        }
      });

    } catch (err) {
      console.error("admin_links error:", err);
      adminLinks.classList.add("hidden");
    }
  });
});
