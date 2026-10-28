(function () {
  const canvas = document.getElementById('matrix');
  const ctx = canvas.getContext('2d');
  const glyphs = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF";

  const FONT_SIZE = 16;
  let cols, drops, cssW, cssH;

  function init() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cssW = window.innerWidth;
    cssH = window.innerHeight;

    canvas.width  = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width  = cssW + 'px';
    canvas.style.height = cssH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cols = Math.max(1, Math.floor(cssW / FONT_SIZE));
    drops = Array(cols).fill(0).map(() => Math.random() * -40);
  }

  function draw() {
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(0, 0, cssW, cssH);
    ctx.fillStyle = '#00ff41';
    ctx.font = FONT_SIZE + 'px monospace';

    for (let i = 0; i < cols; i++) {
      const ch = glyphs[Math.floor(Math.random() * glyphs.length)];
      const y = drops[i] * FONT_SIZE;
      if (y > 0) ctx.fillText(ch, i * FONT_SIZE, y);
      if (y > cssH && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }

  init();
  setInterval(draw, 60);

  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(init, 150);
  });
})();