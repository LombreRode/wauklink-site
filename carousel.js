/* =================================================
   CAROUSEL INFINI — WAULINK
   Interaction souris + tactile
   PAS d’auto-rotation
================================================= */

const carousel = document.getElementById("infinityCarousel");

/* 🔁 12 CARTES — OFFICIELLES */
const services = [
  { label: "Plomberie", href: "./travaux/index.html" },
  { label: "Électricité", href: "./travaux/index.html" },
  { label: "Peinture", href: "./travaux/index.html" },
  { label: "Carrelage", href: "./travaux/index.html" },
  { label: "Maçonnerie", href: "./travaux/index.html" },
  { label: "Toiture", href: "./travaux/index.html" },
  { label: "Serrurerie", href: "./urgences/index.html" },
  { label: "Urgences", href: "./urgences/index.html" },
  { label: "Conciergerie", href: "./index.html" },
  { label: "Photographe", href: "./index.html" },
  { label: "Services à la personne", href: "./services-personne/index.html" },
  { label: "Annonces", href: "./annonces/index.html" }
];

/* CRÉATION CARTES */
services.forEach(s => {
  const card = document.createElement("div");
  card.className = "circle-card";
  card.innerHTML = `
    <h3>${s.label}</h3>
    <div class="open">Ouvrir</div>
  `;
  card.onclick = () => location.href = s.href;
  carousel.appendChild(card);
});

const cards = [...document.querySelectorAll(".circle-card")];
const count = cards.length;
const step = (Math.PI * 2) / count;

let angle = 0;
const radius = 140;

/* POSITIONNEMENT */
function layout() {
  cards.forEach((card, i) => {
    const a = angle + i * step;
    const x = Math.cos(a) * radius;
    const y = Math.sin(a) * radius;
    card.style.transform = `translate(${x}px, ${y}px)`;
  });
}

layout();

/* 🖱️ + 📱 DRAG UNIQUEMENT */
let isDragging = false;
let startX = 0;
let startAngle = 0;

function startDrag(x) {
  isDragging = true;
  startX = x;
  startAngle = angle;
}

function drag(x) {
  if (!isDragging) return;
  angle = startAngle + (x - startX) * 0.005;
  layout();
}

function endDrag() {
  isDragging = false;
}

/* SOURIS */
carousel.addEventListener("mousedown", e => startDrag(e.clientX));
window.addEventListener("mousemove", e => drag(e.clientX));
window.addEventListener("mouseup", endDrag);

/* TACTILE */
carousel.addEventListener("touchstart", e =>
  startDrag(e.touches[0].clientX)
);
carousel.addEventListener("touchmove", e =>
  drag(e.touches[0].clientX)
);
carousel.addEventListener("touchend", endDrag);
