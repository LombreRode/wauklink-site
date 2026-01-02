(() => {
  const circle = document.querySelector(".circle");
  const cards = Array.from(document.querySelectorAll(".circle-card"));
  if (!circle || !cards.length) return;

  const total = cards.length;
  const step = 360 / total;

  let angle = 0;
  let velocity = 0;
  let dragging = false;
  let lastX = 0;

  function layout() {
    const radius = circle.offsetWidth / 2 - 90;

    cards.forEach((card, i) => {
      const a = (i * step + angle) * Math.PI / 180;
      const x = Math.cos(a) * radius;
      const y = Math.sin(a) * radius;
      card.style.transform =
        `translate(-50%, -50%) translate(${x}px, ${y}px)`;
    });
  }

  function animate() {
    if (!dragging) {
      angle += velocity;
      velocity *= 0.98; // inertie ∞
    }
    layout();
    requestAnimationFrame(animate);
  }

  function start(x) {
    dragging = true;
    lastX = x;
  }

  function move(x) {
    if (!dragging) return;
    const delta = x - lastX;
    velocity = delta * 0.15;
    angle += velocity;
    lastX = x;
  }

  function end() {
    dragging = false;
  }

  circle.addEventListener("mousedown", e => start(e.clientX));
  window.addEventListener("mousemove", e => move(e.clientX));
  window.addEventListener("mouseup", end);

  circle.addEventListener("touchstart", e => {
    if (e.touches[0]) start(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener("touchmove", e => {
    if (e.touches[0]) move(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener("touchend", end);

  layout();
  animate();
})();
