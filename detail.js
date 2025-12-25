(() => {
  const services = [
    { key:"locataire", title:"Locataire", segment:"BESOIN", desc:"Demande de service", icon:"images/locataire.svg" },
    { key:"annonce", title:"Déposer vos annonces", segment:"PROPRIÉTAIRE", desc:"Annonce propriétaire", icon:"images/proprietaire-annonce.svg" },
    { key:"conciergerie", title:"Conciergerie", segment:"AIRBNB", desc:"Gestion & accueil", icon:"images/conciergerie.svg" },
    { key:"photographe", title:"Photographe pro", segment:"AIRBNB", desc:"Photos immobilières", icon:"images/photographe.svg" },
    { key:"menage", title:"Ménage", segment:"SERVICE", desc:"Nettoyage pro", icon:"images/menage.svg" },
    { key:"electricite", title:"Électricité", segment:"TRAVAUX", desc:"Interventions rapides", icon:"images/electricite.svg" },
    { key:"plomberie", title:"Plomberie", segment:"TRAVAUX", desc:"Dépannage & pose", icon:"images/plomberie.svg" },
    { key:"peinture", title:"Peinture", segment:"TRAVAUX", desc:"Intérieur / extérieur", icon:"images/peinture.svg" },
    { key:"carrelage", title:"Carrelage", segment:"TRAVAUX", desc:"Pose & rénovation", icon:"images/carrelage.svg" },
    { key:"chauffage", title:"Chauffage", segment:"TRAVAUX", desc:"Entretien & panne", icon:"images/chauffage.svg" },
    { key:"climatisation", title:"Climatisation", segment:"TRAVAUX", desc:"Installation & maintenance", icon:"images/climatisation.svg" },
    { key:"maconnerie", title:"Maçonnerie", segment:"TRAVAUX", desc:"Petits & gros travaux", icon:"images/maconnerie.svg" },
    { key:"toiture", title:"Toiture", segment:"TRAVAUX", desc:"Réparation & contrôle", icon:"images/toiture.svg" },
    { key:"serrurerie", title:"Serrurerie", segment:"TRAVAUX", desc:"Ouverture & sécurisation", icon:"images/serrurerie.svg" },
  ];

  const params = new URLSearchParams(location.search);
  const key = params.get("service");
  const service = services.find(s => s.key === key) || services[0];

  const titleEl = document.getElementById("title");
  const segmentEl = document.getElementById("segment");
  const descEl = document.getElementById("desc");
  const iconEl = document.getElementById("icon");

  if (titleEl) titleEl.textContent = service.title;
  if (segmentEl) segmentEl.textContent = service.segment;
  if (descEl) descEl.textContent = service.desc;

  if (iconEl) {
    iconEl.src = service.icon;
    iconEl.alt = service.title;
  }

  document.title = `WAUKLINK • ${service.title}`;

  const form = document.getElementById("form");
  const note = document.getElementById("note");

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name")?.value?.trim() || "";
    const phone = document.getElementById("phone")?.value?.trim() || "";
    const msg = document.getElementById("msg")?.value?.trim() || "";

    // Démo (plus tard on branchera email/whatsapp)
    if (note) note.textContent = `✅ Demande envoyée (démo) — ${service.title} | ${name} | ${phone}`;
    form.reset();
  });
})();
