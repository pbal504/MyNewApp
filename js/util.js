// Shared helpers for all canvases.
window.MGR = window.MGR || {};

(function (M) {
  "use strict";

  M.TAU = Math.PI * 2;

  M.palette = {
    pink: "#ff2e93",
    purple: "#8a3ffc",
    yellow: "#ffd23f",
    teal: "#00e0c6",
    orange: "#ff8c42",
    blue: "#3ec5ff",
    lime: "#9cff57",
    white: "#fff7fb",
    ink: "#1d0848",
  };

  // Sizes a canvas to its CSS width (and device pixel ratio) while letting
  // drawing code use a fixed logical coordinate system of w x h.
  M.setupCanvas = function (canvas, w, h) {
    const ctx = canvas.getContext("2d");
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = canvas.clientWidth || w;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(((cssW * h) / w) * dpr);
      ctx.setTransform(canvas.width / w, 0, 0, canvas.height / h, 0, 0);
    }
    resize();
    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener("resize", resize);
    return ctx;
  };

  // Runs draw(dt) every frame, but only while the canvas is on screen.
  M.animate = function (canvas, draw) {
    let visible = true;
    let last = performance.now();
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        last = performance.now();
      }).observe(canvas);
    }
    function frame(now) {
      const dt = Math.max(0, Math.min((now - last) / 1000, 0.05));
      last = now;
      if (visible) draw(dt, now / 1000);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };

  M.roundRect = function (ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  M.approach = function (cur, target, step) {
    if (cur < target) return Math.min(cur + step, target);
    return Math.max(cur - step, target);
  };

  M.arrow = function (ctx, x1, y1, x2, y2, color, width) {
    const len = Math.hypot(x2 - x1, y2 - y1);
    if (len < 2) return;
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const head = Math.min(14, len * 0.5);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width || 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2 - Math.cos(ang) * head * 0.6, y2 - Math.sin(ang) * head * 0.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - Math.cos(ang - 0.45) * head, y2 - Math.sin(ang - 0.45) * head);
    ctx.lineTo(x2 - Math.cos(ang + 0.45) * head, y2 - Math.sin(ang + 0.45) * head);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  // A rounded "pill" label with text; returns nothing. Clamped to the canvas.
  M.pill = function (ctx, text, x, y, opts) {
    opts = opts || {};
    const size = opts.size || 14;
    ctx.save();
    ctx.font = "700 " + size + "px Fredoka, Nunito, sans-serif";
    const w = ctx.measureText(text).width + size * 1.4;
    const h = size * 1.9;
    if (opts.maxX) x = Math.max(w / 2 + 4, Math.min(opts.maxX - w / 2 - 4, x));
    ctx.globalAlpha = opts.alpha == null ? 1 : opts.alpha;
    M.roundRect(ctx, x - w / 2, y - h / 2, w, h, h / 2);
    ctx.fillStyle = opts.bg || M.palette.ink;
    ctx.fill();
    if (opts.border) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = opts.border;
      ctx.stroke();
    }
    ctx.fillStyle = opts.color || M.palette.white;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y + 1);
    ctx.restore();
    return { x: x, y: y, w: w, h: h };
  };
})(window.MGR);
