(function () {
  const canvas = document.getElementById('heartCanvas');
  const ctx    = canvas.getContext('2d');

  let heartRunning = false;
  let rafId = null;
  let cssW = 0, cssH = 0;

  const PHRASES      = ['i love you', 'you are only mine'];
  const LIFETIME_MIN = 6;
  const LIFETIME_MAX = 12;
  const FADE_IN      = 0.8;
  const FADE_OUT     = 1.8;

  let MAX_WORDS;
  let SPAWN_PER_FRAME;
  let MIN_SIZE, MAX_SIZE;

  function setup() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cssW = window.innerWidth;
    cssH = window.innerHeight;

    canvas.width  = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width  = cssW + 'px';
    canvas.style.height = cssH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function build() {
    const isMobile = cssW < 600;

    MAX_WORDS       = isMobile ? 180 : 320;
    SPAWN_PER_FRAME = 3;
    MIN_SIZE        = isMobile ? 8   : 7;
    MAX_SIZE        = isMobile ? 13  : 14;

    const N = 240;
    const points = [];
    for (let i = 0; i < N; i++) {
      const t = (i / N) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      points.push({ x, y });
    }

    const scale = Math.min(cssW, cssH) / (isMobile ? 38 : 42);
    const cx = cssW / 2;
    const cy = cssH / 2;

    const screenPoints = points.map(p => ({
      x: cx + p.x * scale,
      y: cy - p.y * scale
    }));

    function isInside(x, y) {
      let inside = false;
      for (let i = 0, j = screenPoints.length - 1; i < screenPoints.length; j = i++) {
        const xi = screenPoints[i].x, yi = screenPoints[i].y;
        const xj = screenPoints[j].x, yj = screenPoints[j].y;
        if (((yi > y) !== (yj > y)) &&
            (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)) {
          inside = !inside;
        }
      }
      return inside;
    }

    const minX = Math.min(...screenPoints.map(p => p.x));
    const maxX = Math.max(...screenPoints.map(p => p.x));
    const minY = Math.min(...screenPoints.map(p => p.y));
    const maxY = Math.max(...screenPoints.map(p => p.y));

    const words = [];

    function spawnOne(elapsed) {
      for (let attempt = 0; attempt < 40; attempt++) {
        const x = minX + Math.random() * (maxX - minX);
        const y = minY + Math.random() * (maxY - minY);
        if (!isInside(x, y)) continue;

        if (words.length >= MAX_WORDS) words.shift();

        words.push({
          x, y,
          text:     PHRASES[Math.floor(Math.random() * PHRASES.length)],
          size:     MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE),
          birth:    elapsed,
          lifetime: LIFETIME_MIN + Math.random() * (LIFETIME_MAX - LIFETIME_MIN),
          maxAlpha: 0.35 + Math.random() * 0.65
        });
        return true;
      }
      return false;
    }

    const startTime = performance.now();

    function animate() {
      if (!heartRunning) return;

      const elapsed = (performance.now() - startTime) / 1000;
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const pulse = 6 + Math.sin(elapsed * 2.2) * 4;
      ctx.shadowBlur  = pulse;
      ctx.shadowColor = '#00ff41';
      ctx.fillStyle   = '#00ff41';

      for (let i = words.length - 1; i >= 0; i--) {
        const w = words[i];
        const age = elapsed - w.birth;

        if (age >= w.lifetime) {
          words.splice(i, 1);
          continue;
        }

        let alpha;
        if (age < FADE_IN) {
          alpha = age / FADE_IN;
        } else if (age > w.lifetime - FADE_OUT) {
          alpha = (w.lifetime - age) / FADE_OUT;
        } else {
          alpha = 1;
        }
        alpha = Math.max(0, Math.min(1, alpha)) * w.maxAlpha;

        if (alpha > 0.01) {
          ctx.globalAlpha = alpha;
          ctx.font = `${w.size}px 'Courier New', monospace`;
          ctx.fillText(w.text, w.x, w.y);
        }
      }

      let spawned = 0;
      while (words.length < MAX_WORDS && spawned < SPAWN_PER_FRAME) {
        if (spawnOne(elapsed)) spawned++;
        else break;
      }

      ctx.globalAlpha = 0.55 + Math.sin(elapsed * 2.2) * 0.15;
      ctx.strokeStyle = '#00ff41';
      ctx.lineWidth   = 2;
      ctx.shadowBlur  = 18;
      ctx.beginPath();
      screenPoints.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else         ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.stroke();

      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(animate);
    }

    animate();
  }

  function show() {
    document.getElementById('app').style.display = 'none';
    canvas.style.display = 'block';
    setup();
    heartRunning = true;
    build();
  }

  let rt;
  window.addEventListener('resize', () => {
    if (!heartRunning) return;
    clearTimeout(rt);
    rt = setTimeout(() => {
      heartRunning = false;
      if (rafId) cancelAnimationFrame(rafId);
      setup();
      heartRunning = true;
      build();
    }, 250);
  });

  window.startHeart = show;
})();