/* =================================================
   CARROUSEL CIRCULAIRE — WAUKLINK
   UI ONLY • Accessible • Mobile Safe
================================================= */

/* =========================
   CONFIG CARTES
========================= */
const CAROUSEL_CARDS = [
  { label: "Toutes les annonces", href: "/wauklink-site/annonces/", icon: "📚" },
  { label: "Location saisonnière", href: "/wauklink-site/annonces/location.html", icon: "🏖️" },
  { label: "Location annuelle", href: "/wauklink-site/annonces/location.html", icon: "🏠" },
  { label: "Travaux (PRO)", href: "/wauklink-site/dashboard/", icon: "🛠️" },
  { label: "Services à la personne", href: "/wauklink-site/annonces/services.html", icon: "🧼" },
  { label: "Urgences", href: "/wauklink-site/annonces/urgences.html", icon: "⚡" },
  { label: "Conciergerie", href: "/wauklink-site/annonces/conciergerie.html", icon: "🧾" },
  { label: "Airbnb", href: "/wauklink-site/annonces/airbnb.html", icon: "🛎️" },
  { label: "Dépannage", href: "/wauklink-site/annonces/depannage.html", icon: "🔧" },
  { label: "Nettoyage", href: "/wauklink-site/annonces/nettoyage.html", icon: "🧹" },
  { label: "Espace prestataire", href: "/wauklink-site/dashboard/", icon: "👷" },
  { label: "Tarifs", href: "/wauklink-site/pricing.html", icon: "💶" }
];

/* =========================
   BOOT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.getElementById("circleWrapper");
  const circle  = document.getElementById("circle");
  if (!wrapper || !circle) return;

  let rotation = 0;
  let isDown = false;
  let dragged = false;
  let startX = 0;
  let startRotation = 0;
  const DRAG_THRESHOLD = 8;

  function radius() {
    const size = Math.min(wrapper.clientWidth, wrapper.clientHeight);
    if (size < 420) return Math.max(170, size * 0.45);
    return Math.max(150, size * 0.40);
  }

  function render() {
    circle.innerHTML = "";
    const step = 360 / CAROUSEL_CARDS.length;
    const r = radius();

    CAROUSEL_CARDS.forEach((c, i) => {
      const angle = i * step + rotation;
      const card = document.createElement("button");
      card.type = "button";
      card.className = "circle-card";
      card.dataset.href = c.href;
      card.setAttribute("aria-label", c.label);

      card.innerHTML = `
        <div class="circle-icon" aria-hidden="true">${c.icon}</div>
        <h3>${c.label}</h3>
        <div class="open">Ouvrir</div>
      `;

      card.style.transform =
        `translate(-50%, -50%) rotate(${angle}deg)
         translate(${r}px) rotate(${-angle}deg)`;

      card.addEventListener("click", () => {
        if (c.href) window.location.href = c.href;
      });

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

  wrapper.addEventListener("pointerup", () => {
    isDown = false;
    dragged = false;
  });

  circle.addEventListener("keydown", (e) => {
    const cards = [...circle.querySelectorAll(".circle-card")];
    const index = cards.indexOf(document.activeElement);
    if (index === -1) return;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      cards[(index + 1) % cards.length].focus();
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      cards[(index - 1 + cards.length) % cards.length].focus();
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const href = cards[index].dataset.href;
      if (href) window.location.href = href;
    }
  });

  window.addEventListener("resize", render);
  render();
});
