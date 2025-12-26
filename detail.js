import { auth, db } from "./auth/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

(() => {
  // ---------- DOM ----------
  const titleEl = document.getElementById("title");
  const segmentEl = document.getElementById("segment");
  const descEl = document.getElementById("desc");
  const iconEl = document.getElementById("icon");
  const noteEl = document.getElementById("note");
  const statusLine = document.getElementById("statusLine");

  const btnMail = document.getElementById("btnMail");
  const btnCall = document.getElementById("btnCall");
  const btnReport = document.getElementById("btnReport");
  const btnEditPhotos = document.getElementById("btnEditPhotos");

  const form = document.getElementById("form");

  function setText(el, t) { if (el) el.textContent = t ?? ""; }
  function setHidden(el, hide) { if (!el) return; el.classList.toggle("hidden", !!hide); }

  // ---------- URL params ----------
  const params = new URLSearchParams(location.search);
  const annonceId = params.get("id");         // ✅ mode annonce
  const serviceKey = params.get("service");   // ✅ mode service

  // ---------- helpers ----------
  function ownerUid(data){
    return (data && (data.ownerUid || data.ownerId)) ? (data.ownerUid || data.ownerId) : "";
  }

  async function loadRole(uid){
    const uref = doc(db, "users", uid);
    const usnap = await getDoc(uref);
    const u = usnap.exists() ? usnap.data() : {};
    return String(u.role || "").toLowerCase();
  }

  async function loadAnnonce(id){
    const aref = doc(db, "annonces_location", id);
    const snap = await getDoc(aref);
    if (!snap.exists()) throw new Error("Annonce introuvable");
    return snap.data();
  }

  function canSeeEditPhotos(annonce, user, role){
    if (!annonce || !user) return false;
    if (String(annonce.status || "") !== "active") return false; // ✅ seulement après publication
    const isOwner = ownerUid(annonce) === user.uid;
    const isAdmin = role === "admin";
    const isMod = role === "moderator";
    return isOwner || isAdmin || isMod;
  }

  // ---------- MODE SERVICE (ton code) ----------
  const services = [
    { key:"locataire", title:"Locataire", segment:"BESOIN", desc:"Demande de service", icon:"images/locataire.svg" },
    { key:"annonce", title:"Déposer vos annonces", segment:"PROPRIÉTAIRE", desc:"Annonce propriétaire", icon:"images/proprietaire-annonce.svg" },
    { key:"conciergerie", title:"Conciergerie", segment:"AIRBNB", desc:"Gestion & accueil", icon:"images/conciergerie.svg" },
    { key:"photographe", title:"Photographe pro", segment:"AIRBNB", desc:"Photos immobilières", icon:"images/photographe.svg" },
    { key:"menage", title:"Ménage", segment:"SERVICE", desc:"Nettoyage pro", icon:"images/menage.svg" },
    { key:"electricite", title:"Électricité", segment:"TRAVAUX", desc:"Interventions rapides", icon:"images/electricite.svg" },
    { key:"plomberie", title:"Plomberie", segment:"TRAVAUX", desc:"Dépannage & pose", icon:"images/plomberie.svg" },
    { key:"peinture", title:"Peinture", segment:"TRAVAUX", desc:"Intérieur / extérieur", icon:"images/peinture.svg" },
    { key:"carrelage", title:"Carrelage", segment:"TRAVAUX", desc:"Pose & rénovation", icon:"images/carrelage.svg" },
    { key:"chauffage", title:"Chauffage", segment:"TRAVAUX", desc:"Entretien & panne", icon:"images/chauffage.svg" },
    { key:"climatisation", title:"Climatisation", segment:"TRAVAUX", desc:"Installation & maintenance", icon:"images/climatisation.svg" },
    { key:"maconnerie", title:"Maçonnerie", segment:"TRAVAUX", desc:"Petits & gros travaux", icon:"images/maconnerie.svg" },
    { key:"toiture", title:"Toiture", segment:"TRAVAUX", desc:"Réparation & contrôle", icon:"images/toiture.svg" },
    { key:"serrurerie", title:"Serrurerie", segment:"TRAVAUX", desc:"Ouverture & sécurisation", icon:"images/serrurerie.svg" },
  ];

  function renderService(key){
    const service = services.find(s => s.key === key) || services[0];
    setText(titleEl, service.title);
    setText(segmentEl, service.segment);
    setText(descEl, service.desc);
    if (iconEl) { iconEl.src = service.icon; iconEl.alt = service.title; }
    document.title = `WAUKLINK • ${service.title}`;

    // En mode service, on cache le bouton modifier photos
    setHidden(btnEditPhotos, true);

    // En mode service : mail/call inutiles => on grise
    if (btnMail) { btnMail.href = "#"; btnMail.style.opacity = ".5"; btnMail.style.pointerEvents = "none"; }
    if (btnCall) { btnCall.href = "#"; btnCall.style.opacity = ".5"; btnCall.style.pointerEvents = "none"; }

    btnReport && (btnReport.onclick = () => setText(noteEl, "✅ Merci, signalement reçu."));

    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("name")?.value?.trim() || "";
      const phone = document.getElementById("phone")?.value?.trim() || "";
      setText(noteEl, `✅ Demande envoyée (démo) — ${service.title} | ${name} | ${phone}`);
      form.reset();
    });
  }

  // ---------- MODE ANNONCE (Firestore) ----------
  async function renderAnnonce(annonce, currentUser, currentRole){
    setText(titleEl, annonce.titre || "Annonce");
    setText(segmentEl, annonce.ville || "");
    setText(descEl, annonce.description || "");
    if (iconEl) { iconEl.src = (annonce.photos && annonce.photos[0]) ? annonce.photos[0] : "images/proprietaire-annonce.svg"; iconEl.alt = "annonce"; }
    document.title = `WAUKLINK • ${annonce.titre || "Annonce"}`;

    setText(statusLine, `status: ${annonce.status || "?"}`);

    const email = annonce.contactEmail || "";
    const phone = annonce.contactPhone || "";

    // mail / tel
    if (btnMail) {
      btnMail.href = email ? `mailto:${encodeURIComponent(email)}` : "#";
      btnMail.style.opacity = email ? "1" : ".5";
      btnMail.style.pointerEvents = email ? "auto" : "none";
    }
    if (btnCall) {
      btnCall.href = phone ? `tel:${phone}` : "#";
      btnCall.style.opacity = phone ? "1" : ".5";
      btnCall.style.pointerEvents = phone ? "auto" : "none";
    }

    // ✅ bouton “Modifier photos” visible seulement si active + owner/admin/mod
    if (btnEditPhotos) {
      const ok = canSeeEditPhotos(annonce, currentUser, currentRole);
      setHidden(btnEditPhotos, !ok);
      btnEditPhotos.href = ok ? `./annonce_edit.html?id=${encodeURIComponent(annonceId)}` : "#";
    }

    // Signalement => écrit dans /reports (optionnel mais utile)
    if (btnReport) {
      btnReport.onclick = async () => {
        try {
          await addDoc(collection(db, "reports"), {
            type: "annonce",
            annonceId,
            createdAt: serverTimestamp(),
            reporterUid: currentUser ? currentUser.uid : null,
            status: "new",
          });
          setText(noteEl, "✅ Merci, signalement envoyé.");
        } catch (e) {
          console.error(e);
          setText(noteEl, "❌ Impossible d’envoyer le signalement.");
        }
      };
    }

    // Form “Faire une demande” => mailto vers contactEmail
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!email) {
        setText(noteEl, "❌ Pas d’email sur cette annonce.");
        return;
      }
      const name = document.getElementById("name")?.value?.trim() || "";
      const tel = document.getElementById("phone")?.value?.trim() || "";
      const msg = document.getElementById("msg")?.value?.trim() || "";

      const subject = `Demande WAUKLINK — ${annonce.titre || "Annonce"}`;
      const body =
        `Nom: ${name}\nTéléphone: ${tel}\n\nMessage:\n${msg}\n\nAnnonce: ${annonceId}`;

      window.location.href =
        `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }

  // ---------- BOOT ----------
  onAuthStateChanged(auth, async (u) => {
    // Si on a un id => mode annonce (même si user pas connecté, on affiche l’annonce)
    if (annonceId) {
      let currentRole = "";
      if (u) {
        try { currentRole = await loadRole(u.uid); } catch { currentRole = ""; }
      }
      try {
        const annonce = await loadAnnonce(annonceId);
        await renderAnnonce(annonce, u || null, currentRole);
      } catch (e) {
        console.error(e);
        setText(titleEl, "❌ Erreur");
        setText(descEl, e.message || "Impossible de charger l’annonce");
      }
      return;
    }

    // Sinon => mode service (comme avant)
    renderService(serviceKey || "locataire");
  });

})();
