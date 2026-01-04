// ================================
// WAUKLINK — CAROUSEL CIRCULAIRE FINAL
// ================================

const container = document.getElementById("circle");
if (!container) {
  console.error("❌ #circle introuvable");
}

// ⚠️ rôle utilisateur (temporaire)
// free | user | pro
window.USER_ROLE = window.USER_ROLE || "free";

// 🎯 CARTES VALIDÉES (8)
const items = [
  {
    label: "Urgences",
    icon: "🚨",
    url: "/wauklink-site/urgences/index.html"
  },
  {
    label: "Travaux",
    icon: "🛠️",
    url: "/wauklink-site/travaux/index.html"
  },
  {
    label: "Services & Aide",
    icon: "🤝",
    url: "/wauklink-site/services-personne/index.html"
  },
  {
    label: "Emploi",
    icon: "💼",
    url: "/wauklink-site/emploi/index.html"
  },
  {
    label: "Location immobilière",
    icon: "🏠",
    url: "/wauklink-site/locations/immobilier.html"
  },
  {
    label: "Location loisir",
    icon: "🌴",
    url: "/wauklink-site/locations/loisir.html"
  },
  {
    label: "Autres locations",
    icon: "📦",
    url: "/wauklink-site/locations/autres.html"
  },
  {
    label: "Déposer une annonce",
    icon: "➕",
    url: "/wauklink-site/deposer/annonce-location.html"
  }
];


// 🧱 CRÉATION DES CARTES
const cards = items.map(item => {
  const el = document.createElement("div");
  el.className = "circle-card";

  el.innerHTML = `
    <h3>${item.icon} ${item.label}</h3>
    <div class="open">
      ${item.action === "deposer" ? "Publier" : "Explorer"}
    </div>
  `;

  el.onclick = () => {
    if (item.action === "deposer") {
      if (window.USER_ROLE === "free") {
        location.href = "./pricing.html";
      } else {
        location.href = "./deposer/annonce-location.html";
      }
    } else {
      location.href = item.url;
    }
  };

  container.appendChild(el);
  return el;
});

// 🧮 GÉOMÉTRIE
let angle = 0;
const radiusX = 220;
const radiusY = 120;
const centerX = 280;
const centerY = 180;

// 📐 POSITIONNEMENT
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

// 🖱️ DRAG / TOUCH
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
