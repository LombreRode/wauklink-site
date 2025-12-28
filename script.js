// WAUKLINK /script.js
// ✅ Version UI ONLY – compatible GitHub Pages

/* =========================
   CONFIG – CARTES CARROUSEL
========================= */
const CAROUSEL_CARDS = [
  { label: "Toutes les annonces", href: "#", icon: "📚" },
  { label: "Location saisonnière", href: "#", icon: "🏖️" },
  { label: "Location annuelle", href: "#", icon: "🏠" },
  { label: "Travaux (PRO)", href: "#", icon: "🛠️" },
  { label: "Services à la personne", href: "#", icon: "🧼" },
  { label: "Urgences", href: "#", icon: "⚡" },
  { label: "Déposer une annonce", href: "pricing.html", icon: "📤" },
  { label: "Espace prestataire", href: "#", icon: "👷" },
  { label: "Tarifs", href: "pricing.html", icon: "💶" }
];

/* =========================
   BOOT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.getElementById("circleWrapper");
  const circle  = document.getElementById("circle");

  if (!wrapper || !circle) {
    console.error("❌ circleWrapper ou circle manquant");
    return;
  }

  let rotation = 0;
  let isDown = false;
  let dragged = false;
  let startX = 0;
  let startRotation = 0;
  const DRAG_THRESHOLD = 8;

  function radius() {
    const size = Math.min(wrapper.clientWidth, wrapper.clientHeight);
    return Math.max(120, size * 0.34);
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
        `translate(-50%, -50%) rotate(${angle}deg) translate(${r}px) rotate(${-angle}deg)`;

      circle.appendChild(card);
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
    if (Math.abs(dx) > DRAG_THRESHOLD) dragged = true;
    if (dragged) {
      rotation = startRotation + dx * 0.35;
      render();
    }
  });

  wrapper.addEventListener("pointerup", (e) => {
    isDown = false;
    if (!dragged) {
      const card = e.target.closest(".circle-card");
      if (card && card.dataset.href !== "#") {
        window.location.href = card.dataset.href;
      }
    }
    dragged = false;
  });

  window.addEventListener("resize", render);
  render();
});
