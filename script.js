// WAUKLINK /script.js
// ⚠️ DOIT être chargé avec <script type="module" src="script.js"></script>

import { isAuthed } from "./_shared/guard.js";

/* =========================
   CONFIG – CARTES CARROUSEL
========================= */
const CAROUSEL_CARDS = [
  { label: "Toutes les annonces", href: "annonces/index.html", icon: "📚" },

  { label: "Location saisonnière", href: "annonces/location.html?duree=saisonniere", icon: "🏖️" },
  { label: "Location annuelle", href: "annonces/location.html?duree=annuelle", icon: "🏠" },

  { label: "Travaux (PRO)", href: "travaux/index.html", icon: "🛠️" },
  { label: "Services à la personne", href: "services-personne/index.html", icon: "🧼" },
  { label: "Urgences", href: "urgences/index.html", icon: "⚡" },

  { label: "Demande de travaux", href: "deposer/demande-travaux.html", icon: "📝" },
  { label: "Demande d’urgence", href: "deposer/demande-urgence.html", icon: "🚨" },

  { label: "Déposer une annonce", href: "deposer/annonce-location.html", icon: "📤" },

  { label: "Espace prestataire", href: "prestataires/index.html", icon: "👷" },
  { label: "Tarifs", href: "pricing.html", icon: "💶" },
  { label: "Comment ça marche", href: "comment-ca-marche.html", icon: "❓" },
  { label: "Sécurité", href: "responsabilites.html", icon: "🛡️" }
];

/* =========================
   BOOT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.getElementById("circleWrapper");
  const circle  = document.getElementById("circle");

  if (!wrapper || !circle) {
    console.error("❌ circleWrapper ou circle manquant dans le HTML");
    return;
  }

  let rotation = 0;
  let isDown = false;
  let dragged = false;
  let startX = 0;
  let startRotation = 0;

  const DRAG_THRESHOLD = 8;

  /* =========================
     RAYON RESPONSIVE
  ========================= */
  function radius() {
    const size = Math.min(wrapper.clientWidth, wrapper.clientHeight);
    return Math.max(120, size * 0.34);
  }

  /* =========================
     RENDER CAROUSEL
  ========================= */
  function render() {
    circle.innerHTML = "";

    const step = 360 / CAROUSEL_CARDS.length;
    const r = radius();

    CAROUSEL_CARDS.forEach((cardData, index) => {
      const angle = index * step + rotation;

      const card = document.createElement("div");
      card.className = "circle-card";
      card.dataset.href = cardData.href;

      card.innerHTML = `
        <div class="circle-icon">${cardData.icon}</div>
        <h3>${cardData.label}</h3>
        <div class="open">Ouvrir →</div>
      `;

      card.style.transform =
        `translate(-50%, -50%) rotate(${angle}deg) translate(${r}px) rotate(${-angle}deg)`;

      circle.appendChild(card);
    });
  }

  /* =========================
     OUVERTURE CARTE (AUTH)
  ========================= */
  function openCard(url) {
    isAuthed((ok) => {
      if (!ok) {
        alert("🔒 Connecte-toi pour accéder à la plateforme.");
        window.location.href = "./auth/login.html";
        return;
      }
      window.location.href = url;
    });
  }

  /* =========================
     EVENTS POINTER (DRAG)
  ========================= */
  wrapper.addEventListener("pointerdown", (e) => {
    isDown = true;
    dragged = false;
    startX = e.clientX;
    startRotation = rotation;
    wrapper.setPointerCapture(e.pointerId);
  });

  wrapper.addEventListener("pointermove", (e) => {
    if (!isDown) return;

    const dx = e.clientX - startX;
    if (Math.abs(dx) > DRAG_THRESHOLD) dragged = true;

    if (dragged) {
      rotation = startRotation + dx * 0.35;
      render();
    }
  });

  wrapper.addEventListener("pointerup", (e) => {
    isDown = false;
    wrapper.releasePointerCapture(e.pointerId);

    if (!dragged) {
      const card = e.target.closest(".circle-card");
      if (card) openCard(card.dataset.href);
    }

    dragged = false;
  });

  wrapper.addEventListener("pointerleave", () => {
    isDown = false;
    dragged = false;
  });

  /* =========================
     RESIZE
  ========================= */
  window.addEventListener("resize", render);

  /* =========================
     INIT
  ========================= */
  render();
});
