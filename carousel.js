/* =========================================
   CARROUSEL ∞ — WAULINK
   Mouvement fluide type signe infini
========================================= */

const container = document.getElementById("infinityCarousel");

/* ⚠️ CARTES OFFICIELLES (12) */
const services = [
  { title:"Chauffage", href:"./services/chauffage.html" },
  { title:"Climatisation", href:"./services/climatisation.html" },
  { title:"Maçonnerie", href:"./travaux/index.html" },
  { title:"Couverture / Toiture", href:"./travaux/index.html" },
  { title:"Serrurerie", href:"./urgences/index.html" },
  { title:"Locataire", href:"./services-personne/index.html" },
  { title:"Déposer vos annonces", href:"./deposer/index.html" },
  { title:"Conciergerie", href:"./services/conciergerie.html" },
  { title:"Photographe Pro", href:"./services/photographe.html" },
  { title:"Ménage", href:"./services/menage.html" },
  { title:"Électricité", href:"./services/electricite.html" },
  { title:"Plomberie", href:"./services/plomberie.html" }
];

const cards = [];
let t = 0;
let speed = 0.0018;

/* Création DOM */
services.forEach(s=>{
  const card = document.createElement("div");
  card.className = "circle-card";
  card.innerHTML = `<h3>${s.title}</h3><div class="open">Ouvrir</div>`;
  card.onclick = ()=> location.href = s.href;
  container.appendChild(card);
  cards.push(card);
});

/* ANIMATION ∞ (LEMNISCATE) */
function animate(){
  t += speed;

  cards.forEach((card,i)=>{
    const p = t + (i / cards.length) * Math.PI * 2;

    const a = 220;   // largeur ∞
    const b = 90;    // hauteur ∞

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

/* DRAG */
let dragging=false,lastX=0;
container.addEventListener("mousedown",e=>{
  dragging=true; lastX=e.clientX;
});
window.addEventListener("mousemove",e=>{
  if(!dragging) return;
  t += (e.clientX-lastX)*0.00001;
  lastX=e.clientX;
});
window.addEventListener("mouseup",()=>dragging=false);
