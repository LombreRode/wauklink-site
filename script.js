(() => {
  const circle = document.querySelector(".circle");
  const cards = [...document.querySelectorAll(".circle-card")];
  if (!circle || !cards.length) return;

  const step = 360 / cards.length;
  let angle = 0;
  let speed = 0.02; // rotation automatique ∞

  function layout() {
    const r = circle.offsetWidth / 2 - 90;

    cards.forEach((c, i) => {
      const a = (i * step + angle) * Math.PI / 180;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;

      c.style.transform =
        `translate(-50%, -50%) translate(${x}px, ${y}px)`;
    });
  }

  function loop() {
    angle += speed;
    layout();
    requestAnimationFrame(loop);
  }

  cards.forEach(card => {
    card.addEventListener("click", () => {
      const link = card.dataset.link;
      if (link) location.href = link;
    });
  });

  layout();
  loop();
})();
