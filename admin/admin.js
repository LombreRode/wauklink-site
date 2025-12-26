import { requireModeration } from "./_shared/guard.js";

function setMeta(text) {
  const el = document.getElementById("adminMeta");
  if (el) el.textContent = text;
}

function hideByRole(role) {
  const cards = document.querySelectorAll("[data-minrole]");
  cards.forEach((card) => {
    const min = card.getAttribute("data-minrole"); // "admin" ou "moderator"
    const ok =
      (min === "admin" && role === "admin") ||
      (min === "moderator" && (role === "admin" || role === "moderator"));
    card.classList.toggle("hidden", !ok);
  });
}

requireModeration({
  redirectTo: "../index.html",
  onLoading: () => setMeta("Vérification du rôle…"),
  onOk: (user, role) => {
    setMeta(`Connecté : ${user.email || "ok"} • role: ${role}`);
    hideByRole(role);
  },
  onFail: () => {
    alert("⛔ Accès refusé : réservé admin/modérateur.");
  }
});
