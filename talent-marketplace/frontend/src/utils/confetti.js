// Lightweight HTML5 Canvas Gold Stardust Confetti Particle System
// Zero external libraries. 60 FPS physics animation with automatic cleanup.

export function fireGoldConfetti(opts = {}) {
  if (typeof window === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const colors = opts.colors || ['#d4af37', '#f5e7ba', '#ffffff', '#eab308', '#ca8a04', '#fafafa'];
  const particleCount = opts.particleCount || 75;
  const particles = [];

  const originX = opts.x !== undefined ? opts.x : width / 2;
  const originY = opts.y !== undefined ? opts.y : height * 0.4;

  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 8;
    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2.5,
      size: 3 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      decay: 0.012 + Math.random() * 0.015,
      shape: Math.random() > 0.4 ? 'rect' : 'circle',
    });
  }

  let animationId;
  const startTime = Date.now();

  function render() {
    ctx.clearRect(0, 0, width, height);

    let activeCount = 0;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (p.alpha <= 0) continue;

      activeCount++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.18; // gravity
      p.vx *= 0.98; // drag
      p.alpha -= p.decay;
      p.rotation += p.rotationSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.6);
      }

      ctx.restore();
    }

    if (activeCount > 0 && Date.now() - startTime < 3500) {
      animationId = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animationId);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }
  }

  animationId = requestAnimationFrame(render);
}

export default fireGoldConfetti;
