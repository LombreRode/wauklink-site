// WAUKLINK/script.js  (DOIT être chargé en type="module")
import { isAuthed } from "./auth/guard.js";

const CAROUSEL_CARDS = [
  { label:"Toutes les annonces", href:"annonces/index.html", icon:"📚" },

  // ✅ 2 cartes location
  { label:"Location saisonnière", href:"annonces/location.html?duree=saisonniere", icon:"🏖️" },
  { label:"Location annuelle", href:"annonces/location.html?duree=annuelle", icon:"🏠" },

  { label:"Travaux (PRO)", href:"travaux/index.html", icon:"🛠️" },
  { label:"Services à la personne", href:"services-personne/index.html", icon:"🧼" },
  { label:"Urgences", href:"urgences/index.html", icon:"⚡" },
  { label:"Demande de travaux", href:"deposer/demande-travaux.html", icon:"📝" },
  { label:"Demande d’urgence", href:"deposer/demande-urgence.html", icon:"🚨" },

  // ✅ titre “bien”
  { label:"Déposer une annonce", href:"deposer/annonce-location.html", icon:"📤" },

  { label:"Espace prestataire", href:"prestataires/index.html", icon:"👷" },
  { label:"Tarifs", href:"pricing.html", icon:"💶" },
  { label:"Comment ça marche", href:"comment-ca-marche.html", icon:"❓" },
  { label:"Sécurité", href:"responsabilites.html", icon:"🛡️" }
];

document.addEventListener("DOMContentLoaded", () => {
  const circle = document.getElementById("circle");
  const wrapper = document.getElementById("circleWrapper");
  let rotation = 0;
  let isDown = false;
  let dragged = false;
  let startX = 0;
  let startRotation = 0;
  const DRAG = 8;

  function radius() {
    const s = Math.min(wrapper.clientWidth, wrapper.clientHeight);
    return Math.max(120, s * 0.34);
  }

  function render() {
    circle.innerHTML = "";
    const step = 360 / CAROUSEL_CARDS.length;
    const r = radius();

    CAROUSEL_CARDS.forEach((c, i) => {
      const angle = i * step + rotation;
      const card = document.createElement("div");
      card.className = "circle-card";
      card.dataset.href = c.href;
      card.innerHTML = `
        <div class="circle-icon">${c.icon}</div>
        <h3>${c.label}</h3>
        <div class="open">Ouvrir →</div>
      `;
      card.style.transform =
        `translate(-50%,-50%) rotate(${angle}deg) translate(${r}px) rotate(${-angle}deg)`;
      circle.appendChild(card);
    });
  }

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

  wrapper.addEventListener("pointerdown", (e) => {
    isDown = true;
    dragged = false;
    startX = e.clientX;
    startRotation = rotation;
  });

  wrapper.addEventListener("pointermove", (e) => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > DRAG) dragged = true;
    if (dragged) {
      rotation = startRotation + dx * 0.35;
      render();
    }
  });

  wrapper.addEventListener("pointerup", (e) => {
    isDown = false;
    if (!dragged) {
      const card = e.target.closest(".circle-card");
      if (card) openCard(card.dataset.href);
    }
    dragged = false;
  });

  window.addEventListener("resize", render);
  render();
});
