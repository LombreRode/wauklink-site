/* =================================================
   CAROUSEL ∞ — WAUKLINK
   Centrage RÉEL parfait (desktop + mobile)
================================================= */

const wrapper = document.querySelector(".circle-wrapper");
const container = document.getElementById("infinityCarousel");

/* =========================
   SERVICES
========================= */
const services = [
  "Plomberie",
  "Électricité",
  "Peinture",
  "Carrelage",
  "Maçonnerie",
  "Couverture",
  "Serrurerie",
  "Urgences",
  "Ménage",
  "Conciergerie",
  "Photographe",
  "Annonces"
];

/* =========================
   CRÉATION DES CARTES
========================= */
const cards = services.map(label => {
  const el = document.createElement("div");
  el.className = "circle-card";
  el.innerHTML = `
    <h3>${label}</h3>
    <div class="open">Ouvrir</div>
  `;
  container.appendChild(el);
  return el;
});

/* =========================
   PARAMÈTRES DU CAROUSEL
========================= */
let t = 0;
const radiusX = 200;
const radiusY = 90;

/* =========================
   CENTRE RÉEL DU WRAPPER
========================= */
function getCenter() {
  const rect = wrapper.getBoundingClientRect();
  return {
    x: rect.width / 2,
    y: rect.height / 2
  };
}

let needsUpdate = true;

/* =========================
   POSITIONNEMENT DES CARTES
========================= */
function layout() {
  if (!needsUpdate) return;
  needsUpdate = false;

  const { x: cx, y: cy } = getCenter();

  cards.forEach((card, i) => {
    const angle = t + (i / cards.length) * Math.PI * 2;

    const x = Math.sin(angle) * radiusX;
    const y = Math.cos(angle) * Math.sin(angle) * radiusY;

    card.style.transform = `
      translate(
        ${cx + x - card.offsetWidth / 2}px,
        ${cy + y - card.offsetHeight / 2}px
      )
    `;

    card.style.zIndex = Math.round(100 + y);
  });
}

/* =========================
   LOOP LÉGER
========================= */
function loop() {
  layout();
  requestAnimationFrame(loop);
}
loop();

/* =========================
   DRAG / SWIPE
========================= */
let dragging = false;
let startX = 0;
let startT = 0;

wrapper.addEventListener("pointerdown", e => {
  dragging = true;
  startX = e.clientX;
  startT = t;
  wrapper.setPointerCapture(e.pointerId);
});

wrapper.addEventListener("pointermove", e => {
  if (!dragging) return;
  t = startT + (e.clientX - startX) * 0.004;
  needsUpdate = true;
});

wrapper.addEventListener("pointerup", () => {
  dragging = false;
});

/* =========================
   RECALCUL AU RESIZE
========================= */
window.addEventListener("resize", () => {
  needsUpdate = true;
});
