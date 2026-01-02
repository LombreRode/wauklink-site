// ================================
// WAUKLINK — CAROUSEL CIRCULAIRE
// ================================

const container = document.getElementById("circle");
if (!container) {
  console.error("❌ #circle introuvable");
}

/* SERVICES */
const items = [
  { label: "Plomberie", href: "./travaux/index.html" },
  { label: "Électricité", href: "./travaux/index.html" },
  { label: "Peinture", href: "./travaux/index.html" },
  { label: "Carrelage", href: "./travaux/index.html" },
  { label: "Maçonnerie", href: "./travaux/index.html" },
  { label: "Couverture", href: "./travaux/index.html" },
  { label: "Serrurerie", href: "./urgences/index.html" },
  { label: "Urgences", href: "./urgences/index.html" },
  { label: "Ménage", href: "./services-personne/index.html" },
  { label: "Conciergerie", href: "./services-personne/index.html" },
  { label: "Photographe", href: "./services-personne/index.html" },
  { label: "Annonces", href: "./annonces/index.html" }
];

/* CARTES */
const cards = items.map(item => {
  const el = document.createElement("div");
  el.className = "circle-card";
  el.innerHTML = `
    <h3>${item.label}</h3>
    <div class="open">Ouvrir</div>
  `;
  el.onclick = () => location.href = item.href;
  container.appendChild(el);
  return el;
});

/* GÉOMÉTRIE */
let angle = 0;
const radiusX = 220;
const radiusY = 120;
const centerX = 280;
const centerY = 180;

/* POSITIONNEMENT */
function layout() {
  cards.forEach((card, i) => {
    const a = angle + (i / cards.length) * Math.PI * 2;
    const x = Math.cos(a) * radiusX;
    const y = Math.sin(a) * radiusY;

    card.style.transform =
      `translate(${centerX + x - card.offsetWidth / 2}px,
                 ${centerY + y - card.offsetHeight / 2}px)`;

    card.style.zIndex = Math.round(100 + y);
  });
}

layout();

/* DRAG */
let dragging = false;
let startX = 0;
let startAngle = 0;

container.addEventListener("pointerdown", e => {
  dragging = true;
  startX = e.clientX;
  startAngle = angle;
});

window.addEventListener("pointermove", e => {
  if (!dragging) return;
  angle = startAngle + (e.clientX - startX) * 0.005;
  layout();
});

window.addEventListener("pointerup", () => {
  dragging = false;
});
