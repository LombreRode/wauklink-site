/* =========================================
   CARROUSEL ∞ — WAULINK
   Animation fluide type signe infini
========================================= */

const container = document.getElementById("infinityCarousel");

/* 12 CARTES OFFICIELLES */
const services = [
  { title: "Locataire", href: "./detail.html?service=locataire" },
  { title: "Déposer vos annonces", href: "./detail.html?service=annonce" },
  { title: "Conciergerie", href: "./detail.html?service=conciergerie" },
  { title: "Photographe Pro", href: "./detail.html?service=photographe" },
  { title: "Travaux", href: "./travaux/index.html" },
  { title: "Urgences", href: "./urgences/index.html" },
  { title: "Services à la personne", href: "./services-personne/index.html" },
  { title: "Annonces", href: "./annonces/index.html" },
  { title: "Plomberie", href: "./services/plomberie.html" },
  { title: "Électricité", href: "./services/electricite.html" },
  { title: "Ménage", href: "./services/menage.html" },
  { title: "Chauffage", href: "./services/chauffage.html" }
];

const cards = [];
let t = 0;
let speed = 0.0018;

/* CRÉATION DES CARTES */
services.forEach(service => {
  const card = document.createElement("div");
  card.className = "circle-card";

  card.innerHTML = `
    <h3>${service.title}</h3>
    <div class="open">Ouvrir</div>
  `;

  card.addEventListener("click", () => {
    window.location.href = service.href;
  });

  container.appendChild(card);
  cards.push(card);
});

/* ANIMATION ∞ (LEMNISCATE) */
function animate() {
  t += speed;

  cards.forEach((card, index) => {
    const p = t + (index / cards.length) * Math.PI * 2;

    const a = 220; // largeur
    const b = 90;  // hauteur

    const x = a * Math.sin(p);
    const y = b * Math.sin(p) * Math.cos(p);

    const scale = 0.85 + 0.25 * Math.cos(p);

    card.style.transform =
      `translate(${x + 300}px, ${y + 200}px) scale(${scale})`;

    card.style.zIndex = Math.round(scale * 100);
  });

  requestAnimationFrame(animate);
}

animate();

/* DRAG SOURIS */
let dragging = false;
let lastX = 0;

container.addEventListener("mousedown", e => {
  dragging = true;
  lastX = e.clientX;
});

window.addEventListener("mousemove", e => {
  if (!dragging) return;
  t += (e.clientX - lastX) * 0.00001;
  lastX = e.clientX;
});

window.addEventListener("mouseup", () => {
  dragging = false;
});
