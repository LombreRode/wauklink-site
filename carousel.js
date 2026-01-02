/* =================================================
   CAROUSEL ∞ — WAULINK
   Optimisé MOBILE (fluide)
================================================= */

const container = document.getElementById("infinityCarousel");

/* SERVICES */
const services = [
  "Plomberie","Électricité","Peinture","Carrelage",
  "Maçonnerie","Couverture","Serrurerie","Urgences",
  "Ménage","Conciergerie","Photographe","Annonces"
];

const cards = services.map(label => {
  const el = document.createElement("div");
  el.className = "circle-card";
  el.innerHTML = `<h3>${label}</h3><div class="open">Ouvrir</div>`;
  container.appendChild(el);
  return el;
});

/* PARAMÈTRES ∞ */
let t = 0;
const a = 190;
const b = 85;
const centerX = 280;
const centerY = 210;

/* RAF (limite FPS) */
let needsUpdate = true;

function layout() {
  if (!needsUpdate) return;
  needsUpdate = false;

  cards.forEach((card, i) => {
    const p = t + (i / cards.length) * Math.PI * 2;
    const x = a * Math.sin(p);
    const y = b * Math.sin(p) * Math.cos(p);

    card.style.transform =
      `translate(${centerX + x - card.offsetWidth/2}px,
                 ${centerY + y - card.offsetHeight/2}px)`;

    card.style.zIndex = Math.round(100 + y);
  });
}

/* LOOP LÉGER */
function loop() {
  layout();
  requestAnimationFrame(loop);
}
loop();

/* DRAG OPTIMISÉ */
let dragging = false;
let startX = 0;
let startT = 0;

container.addEventListener("pointerdown", e => {
  dragging = true;
  startX = e.clientX;
  startT = t;
});

window.addEventListener("pointermove", e => {
  if (!dragging) return;
  t = startT + (e.clientX - startX) * 0.004; // ⬅️ plus doux mobile
  needsUpdate = true;
});

window.addEventListener("pointerup", () => {
  dragging = false;
});
