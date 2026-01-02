const carousel = document.getElementById("infinityCarousel");

const services = [
  { label: "Plomberie", href: "./services/plomberie.html" },
  { label: "Électricité", href: "./services/electricite.html" },
  { label: "Peinture", href: "./services/peinture.html" },
  { label: "Carrelage", href: "./services/carrelage.html" },
  { label: "Chauffage", href: "./services/chauffage.html" },
  { label: "Climatisation", href: "./services/climatisation.html" },
  { label: "Maçonnerie", href: "./services/maconnerie.html" },
  { label: "Couverture", href: "./services/couverture.html" },
  { label: "Serrurerie", href: "./services/serrurerie.html" },
  { label: "Conciergerie", href: "./services/conciergerie.html" },
  { label: "Photographe", href: "./services/photographe.html" },
  { label: "Ménage", href: "./services/menage.html" }
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
const total = cards.length;
const radius = 180;
let angle = 0;
const step = (Math.PI * 2) / total;

/* POSITION */
function layout() {
  cards.forEach((card, i) => {
    const a = i * step + angle;
    const x = Math.cos(a) * radius;
    const y = Math.sin(a) * radius;
    card.style.transform = `translate(${x}px, ${y}px)`;
  });
}

layout();

/* DRAG UNIQUEMENT */
let dragging = false;
let startX = 0;
let startAngle = 0;

carousel.addEventListener("mousedown", e => {
  dragging = true;
  startX = e.clientX;
  startAngle = angle;
});

window.addEventListener("mousemove", e => {
  if (!dragging) return;
  angle = startAngle + (e.clientX - startX) * 0.005;
  layout();
});

window.addEventListener("mouseup", () => dragging = false);

/* MOBILE */
carousel.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
  startAngle = angle;
});

carousel.addEventListener("touchmove", e => {
  angle = startAngle + (e.touches[0].clientX - startX) * 0.005;
  layout();
});
