(() => {
  const circle = document.querySelector(".circle");
  const cards = [...document.querySelectorAll(".circle-card")];
  if (!circle || !cards.length) return;

  const step = 360 / cards.length;
  let angle = 0;
  let velocity = 0;
  let dragging = false;
  let lastX = 0;

  function layout() {
    const r = circle.offsetWidth / 2 - 90;
    cards.forEach((c, i) => {
      const a = (i * step + angle) * Math.PI / 180;
      c.style.transform =
        `translate(-50%, -50%) translate(${Math.cos(a)*r}px, ${Math.sin(a)*r}px)`;
    });
  }

  function loop() {
    if (!dragging) {
      angle += velocity;
      velocity *= 0.95;
    }
    layout();
    requestAnimationFrame(loop);
  }

  circle.addEventListener("mousedown", e => {
    dragging = true;
    lastX = e.clientX;
  });

  window.addEventListener("mousemove", e => {
    if (!dragging) return;
    velocity = (e.clientX - lastX) * 0.15;
    angle += velocity;
    lastX = e.clientX;
  });

  window.addEventListener("mouseup", () => dragging = false);

  cards.forEach(c =>
    c.addEventListener("click", () =>
      location.href = c.dataset.link
    )
  );

  layout();
  loop();
})();
