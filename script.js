(() => {
  const circle = document.querySelector(".circle");
  const cards = Array.from(document.querySelectorAll(".circle-card"));
  if (!circle || cards.length === 0) return;

  const step = 360 / cards.length;
  let angle = 0;
  let dragging = false;
  let lastX = 0;

  function layout() {
    const radius = circle.offsetWidth / 2 - 80;

    cards.forEach((card, i) => {
      const a = (i * step + angle) * Math.PI / 180;
      const x = Math.cos(a) * radius;
      const y = Math.sin(a) * radius;

      card.style.transform =
        `translate(-50%, -50%) translate(${x}px, ${y}px)`;
    });
  }

  circle.addEventListener("mousedown", e => {
    dragging = true;
    lastX = e.clientX;
  });

  window.addEventListener("mousemove", e => {
    if (!dragging) return;
    angle += (e.clientX - lastX) * 0.3;
    lastX = e.clientX;
    layout();
  });

  window.addEventListener("mouseup", () => dragging = false);

  cards.forEach(card => {
    card.addEventListener("click", () => {
      const link = card.dataset.link;
      if (link) location.href = link;
    });
  });

  layout();
})();
