/* =================================================
   CAROUSEL ∞ — WAULINK
   Signe infini réel (lemniscate)
   Interaction manuelle uniquement
================================================= */

const container = document.getElementById("infinityCarousel");

/* 12 CARTES */
const services = [
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

/* CRÉATION DES CARTES */
const cards = services.map(s => {
  const el = document.createElement("div");
  el.className = "circle-card";
  el.innerHTML = `<h3>${s.label}</h3><div class="open">Ouvrir</div>`;
  el.onclick = () => location.href = s.href;
  container.appendChild(el);
  return el;
});

/* PARAMÈTRES ∞ */
let t = 0;
const a = 180; // largeur
const b = 90;  // hauteur
const centerX = 260;
const centerY = 210;

/* POSITIONNEMENT */
function layout() {
  cards.forEach((card, i) => {
    const offset = (i / cards.length) * Math.PI * 2;
    const p = t + offset;

    const x = a * Math.sin(p);
    const y = b * Math.sin(p) * Math.cos(p);

    card.style.transform =
      `translate(${centerX + x - card.offsetWidth / 2}px,
                 ${centerY + y - card.offsetHeight / 2}px)`;

    card.style.zIndex = Math.round(100 + y);
  });
}

layout();

/* DRAG UNIQUEMENT */
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
  t = startT + (e.clientX - startX) * 0.005;
  layout();
});

window.addEventListener("pointerup", () => {
  dragging = false;
});
