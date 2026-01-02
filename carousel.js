/* =================================================
   CAROUSEL ∞ — WAULINK
   Centrage RÉEL + mobile fluide
================================================= */

const wrapper = document.querySelector(".circle-wrapper");
const container = document.getElementById("infinityCarousel");

/* SERVICES */
const services = [
  "Plomberie","Électricité","Peinture","Carrelage",
  "Maçonnerie","Couverture","Serrurerie","Urgences",
  "Ménage","Conciergerie","Photographe","Annonces"
];

/* CRÉATION CARTES */
const cards = services.map(label => {
  const el = document.createElement("div");
  el.className = "circle-card";
  el.innerHTML = `<h3>${label}</h3><div class="open">Ouvrir</div>`;
  container.appendChild(el);
  return el;
});

/* PARAMÈTRES ∞ */
let t = 0;
const a = 200; // largeur ∞
const b = 90;  // hauteur ∞

/* CENTRE DYNAMIQUE */
function getCenter() {
  const r = wrapper.getBoundingClientRect();
  return {
    x: r.width / 2,
    y: r.height / 2
  };
}

let needsUpdate = true;

/* POSITIONNEMENT */
function layout() {
  if (!needsUpdate) return;
  needsUpdate = false;

  const { x: cx, y: cy } = getCenter();

  cards.forEach((card, i) => {
    const p = t + (i / cards.length) * Math.PI * 2;

    const x = a * Math.sin(p);
    const y = b * Math.sin(p) * Math.cos(p);

    card.style.transform =
      `translate(${cx + x - card.offsetWidth / 2}px,
                 ${cy + y - card.offsetHeight / 2}px)`;

    card.style.zIndex = Math.round(100 + y);
  });
}

/* LOOP LÉGER */
function loop() {
  layout();
  requestAnimationFrame(loop);
}
loop();

/* DRAG */
let dragging = false;
let startX = 0;
let startT = 0;

wrapper.addEventListener("pointerdown", e => {
  dragging = true;
  startX = e.clientX;
  startT = t;
});

window.addEventListener("pointermove", e => {
  if (!dragging) return;
  t = startT + (e.clientX - startX) * 0.004;
  needsUpdate = true;
});

window.addEventListener("pointerup", () => {
  dragging = false;
});

/* RECALCUL AU RESIZE */
window.addEventListener("resize", () => {
  needsUpdate = true;
});
