// ================================
// WAUKLINK — CAROUSEL CIRCULAIRE
// ================================

const container = document.getElementById("circle");
if (!container) {
  console.error("❌ #circle introuvable");
}

/* SERVICES */
const items = [
  {
    label: "Urgences",
    icon: "🚨",
    url: "./annonces/index.html?type=urgence"
  },
  {
    label: "Travaux",
    icon: "🛠️",
    url: "./annonces/index.html?type=travaux"
  },
  {
    label: "Services & Aide",
    icon: "🤝",
    url: "./annonces/index.html?type=service"
  },
  {
    label: "Emploi",
    icon: "💼",
    url: "./annonces/index.html?type=emploi"
  },
  {
    label: "Location immobilière",
    icon: "🏠",
    url: "./annonces/index.html?type=location&subType=immobilier"
  },
  {
    label: "Location loisir",
    icon: "🌴",
    url: "./annonces/index.html?type=location&subType=loisir"
  },
  {
    label: "Locations diverses",
    icon: "📦",
    url: "./annonces/index.html?type=location&subType=divers"
  },
  {
    label: "Déposer une annonce",
    icon: "➕",
    action: "deposer"
  }
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
