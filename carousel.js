import { auth, db } from "./_shared/firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc, getDoc, addDoc, collection, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

(() => {
  /* =========================
     DOM
  ========================= */
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

  const setText = (el, t) => el && (el.textContent = t ?? "");
  const setHidden = (el, h) => el && el.classList.toggle("hidden", !!h);

  /* =========================
     URL
  ========================= */
  const params = new URLSearchParams(location.search);
  const annonceId = params.get("id");
  const serviceKey = params.get("service");

  /* =========================
     HELPERS
  ========================= */
  const ownerUid = d => d?.ownerUid || d?.ownerId || "";

  async function loadUserRole(uid) {
    if (!uid) return "";
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? String(snap.data().role || "") : "";
  }

  async function loadAnnonce(id) {
    const snap = await getDoc(doc(db, "annonces_location", id));
    if (!snap.exists()) throw new Error("Annonce introuvable");
    return snap.data();
  }

  function canEditPhotos(annonce, user, role) {
    if (!annonce || !user) return false;
    if (annonce.status !== "active") return false;
    if (ownerUid(annonce) === user.uid) return true;
    if (role === "admin" || role === "moderator") return true;
    return false;
  }

  /* =========================
     MODE SERVICE
  ========================= */
  const services = [
    {
      key: "locataire",
      title: "Locataire",
      segment: "BESOIN",
      desc: "Demande de service",
      icon: "/wauklink-site/images/locataire.svg"
    },
    {
      key: "annonce",
      title: "Déposer vos annonces",
      segment: "PROPRIÉTAIRE",
      desc: "Annonce propriétaire",
      icon: "/wauklink-site/images/proprietaire-annonce.svg"
    },
    {
      key: "conciergerie",
      title: "Conciergerie",
      segment: "AIRBNB",
      desc: "Gestion & accueil",
      icon: "/wauklink-site/images/conciergerie.svg"
    },
    {
      key: "photographe",
      title: "Photographe pro",
      segment: "AIRBNB",
      desc: "Photos immobilières",
      icon: "/wauklink-site/images/photographe.svg"
    }
  ];

  function renderService(key) {
    const s = services.find(x => x.key === key) || services[0];

    setText(titleEl, s.title);
    setText(segmentEl, s.segment);
    setText(descEl, s.desc);
    iconEl.src = s.icon;

    setHidden(btnEditPhotos, true);
    btnMail.style.pointerEvents = "none";
    btnCall.style.pointerEvents = "none";

    btnReport.onclick = () =>
      setText(noteEl, "✅ Signalement reçu.");

    form.onsubmit = e => {
      e.preventDefault();
      setText(noteEl, "✅ Demande envoyée.");
      form.reset();
    };
  }

  /* =========================
     MODE ANNONCE
  ========================= */
  async function renderAnnonce(annonce, user) {
    const role = user ? await loadUserRole(user.uid) : "";

    setText(titleEl, annonce.titre);
    setText(segmentEl, annonce.ville);
    setText(descEl, annonce.description);
    iconEl.src =
      annonce.photos?.[0] ||
      "/wauklink-site/images/proprietaire-annonce.svg";

    setText(statusLine, `statut : ${annonce.status}`);

    if (annonce.contactEmail) {
      btnMail.href = `mailto:${annonce.contactEmail}`;
    } else {
      btnMail.style.pointerEvents = "none";
    }

    if (annonce.contactPhone) {
      btnCall.href = `tel:${annonce.contactPhone}`;
    } else {
      btnCall.style.pointerEvents = "none";
    }

    const canEdit = canEditPhotos(annonce, user, role);
    setHidden(btnEditPhotos, !canEdit);

    if (canEdit) {
      btnEditPhotos.href = `annonce_edit.html?id=${annonceId}`;
    }

    btnReport.onclick = async () => {
      await addDoc(collection(db, "reports"), {
        annonceId,
        reporterUid: user?.uid || null,
        reporterRole: role || "guest",
        message: "Signalement utilisateur",
        createdAt: serverTimestamp()
      });
      setText(noteEl, "✅ Signalement envoyé.");
    };

    form.onsubmit = e => {
      e.preventDefault();
      if (!annonce.contactEmail) return;
      const msg = document.getElementById("msg").value || "";
      location.href =
        `mailto:${annonce.contactEmail}?subject=WAUKLINK&body=${encodeURIComponent(msg)}`;
    };
  }

  /* =========================
     BOOT
  ========================= */
  onAuthStateChanged(auth, async user => {
    if (annonceId) {
      try {
        const annonce = await loadAnnonce(annonceId);
        await renderAnnonce(annonce, user);
      } catch (e) {
        setText(titleEl, "Erreur");
        setText(descEl, e.message);
      }
    } else {
      renderService(serviceKey || "locataire");
    }
  });

})();
