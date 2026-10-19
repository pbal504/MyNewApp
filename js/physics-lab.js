// Top-down physics lab: angular vs linear speed and centripetal force.
(function (M) {
  "use strict";

  const P = M.palette;
  const TAU = M.TAU;
  const W = 520, H = 520, CX = 260, CY = 260;
  const MAX_R_M = 9;               // platform radius in metres
  const PX_PER_M = 230 / MAX_R_M;
  const G = 9.81;

  const S = {
    theta: 0,
    rpm: 6,
    r: 7,
    m: 40,
    free: null,     // { x, y, vx, vy, t } when the rider has let go
    trail: [],
  };

  function omega() { return (S.rpm * TAU) / 60; }

  // Counter-clockwise when viewed from above (screen y points down).
  function riderPos(theta, r) {
    return { x: CX + r * PX_PER_M * Math.cos(theta), y: CY - r * PX_PER_M * Math.sin(theta) };
  }

  function update(dt) {
    const w = omega();
    S.theta += w * dt;
    if (S.free) {
      S.free.x += S.free.vx * dt;
      S.free.y += S.free.vy * dt;
      S.free.t += dt;
      S.trail.push({ x: S.free.x, y: S.free.y });
      const out = S.free.x < -40 || S.free.x > W + 40 || S.free.y < -40 || S.free.y > H + 40;
      if (out && S.free.t > 0.5) {
        S.free.wait = (S.free.wait || 0) + dt;
        if (S.free.wait > 0.8) { S.free = null; S.trail = []; }
      }
    }
  }

  function letGo() {
    if (S.free) return;
    const w = omega();
    const p = riderPos(S.theta, S.r);
    const v = w * S.r * PX_PER_M;
    // Tangent to the counter-clockwise circle in screen coords
    S.free = { x: p.x, y: p.y, vx: -Math.sin(S.theta) * v, vy: -Math.cos(S.theta) * v, t: 0 };
    S.trail = [{ x: p.x, y: p.y }];
  }

  function render(ctx) {
    ctx.clearRect(0, 0, W, H);
    const bg = ctx.createRadialGradient(CX, CY, 40, CX, CY, 360);
    bg.addColorStop(0, "#3b1170");
    bg.addColorStop(1, "#1d0848");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const R = MAX_R_M * PX_PER_M;
    // Rotating platform wedges
    for (let k = 0; k < 16; k++) {
      const a0 = -S.theta + (k * TAU) / 16;
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.arc(CX, CY, R, a0, a0 + TAU / 16);
      ctx.closePath();
      ctx.fillStyle = k % 2 ? "#ff2e93" : "#ffd23f";
      ctx.globalAlpha = 0.85;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#00e0c6";
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, TAU);
    ctx.stroke();

    // Distance rings every metre
    ctx.strokeStyle = "rgba(29,8,72,0.35)";
    ctx.lineWidth = 1;
    for (let m = 1; m < MAX_R_M; m++) {
      ctx.beginPath();
      ctx.arc(CX, CY, m * PX_PER_M, 0, TAU);
      ctx.stroke();
    }

    // Rider's circular path
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(CX, CY, S.r * PX_PER_M, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);

    // Centre pole
    ctx.fillStyle = "#fff1a8";
    ctx.beginPath();
    ctx.arc(CX, CY, 12, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#b8860b";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Rotation direction hint
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(CX, CY, R + 14, -0.9, -0.4);
    ctx.stroke();
    M.arrow(ctx, CX + (R + 14) * Math.cos(-0.45), CY + (R + 14) * Math.sin(-0.45),
      CX + (R + 14) * Math.cos(-0.95), CY + (R + 14) * Math.sin(-0.95), "rgba(255,255,255,0.8)", 3);

    const w = omega();
    const v = w * S.r;
    const a = w * w * S.r;

    if (S.free) {
      // Straight-line escape path
      ctx.strokeStyle = P.yellow;
      ctx.lineWidth = 3;
      ctx.setLineDash([2, 8]);
      ctx.beginPath();
      S.trail.forEach(function (p, i) { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
      ctx.stroke();
      ctx.setLineDash([]);
      drawRider(ctx, S.free.x, S.free.y);
      const sp = Math.hypot(S.free.vx, S.free.vy) || 1;
      const k = (v * 9) / sp;
      M.arrow(ctx, S.free.x, S.free.y, S.free.x + S.free.vx * k, S.free.y + S.free.vy * k, P.teal, 5);
      M.pill(ctx, "No inward force → straight line!", CX, 30, { size: 15, bg: P.purple, border: P.yellow });
      // The empty spot on the platform where the rider was
      const p = riderPos(S.theta, S.r);
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 13, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      const p = riderPos(S.theta, S.r);
      // Velocity arrow (tangent)
      const vk = 9;
      M.arrow(ctx, p.x, p.y, p.x - Math.sin(S.theta) * v * vk, p.y - Math.cos(S.theta) * v * vk, P.teal, 5);
      // Centripetal arrow (toward centre)
      const ak = Math.min(a * 14, S.r * PX_PER_M - 16);
      const dx = CX - p.x, dy = CY - p.y, d = Math.hypot(dx, dy) || 1;
      M.arrow(ctx, p.x, p.y, p.x + (dx / d) * ak, p.y + (dy / d) * ak, P.pink, 5);
      drawRider(ctx, p.x, p.y);
    }
  }

  function drawRider(ctx, x, y) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 8;
    ctx.fillStyle = "#8a3ffc";
    ctx.beginPath();
    ctx.arc(x, y, 13, 0, TAU);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 13, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🙂", x, y + 1);
  }

  function fmt(n, d) { return n.toFixed(d); }

  function updateStats(els) {
    const w = omega();
    const v = w * S.r;
    const a = w * w * S.r;
    const F = S.m * a;
    const gForce = a / G;
    els.omega.textContent = fmt(w, 2) + " rad/s";
    els.period.textContent = fmt(60 / S.rpm, 1) + " s";
    els.v.textContent = fmt(v, 1) + " m/s (" + fmt(v * 3.6, 0) + " km/h)";
    els.a.textContent = fmt(a, 2) + " m/s²";
    els.f.textContent = fmt(F, 0) + " N";
    els.g.textContent = fmt(gForce, 2) + " g sideways";
    const pct = Math.min(100, (gForce / 1.2) * 100);
    els.meter.style.width = pct + "%";
    els.meter.style.backgroundPosition = "0 0";
    let msg;
    if (gForce < 0.1) msg = "😌 Gentle: barely feel a pull";
    else if (gForce < 0.3) msg = "🙂 Comfortable: a real carousel feels like this";
    else if (gForce < 0.6) msg = "😮 Strong pull: hold on tight!";
    else msg = "😵 Way too fast: no real carousel goes this fast!";
    els.comfort.textContent = msg;
  }

  function init() {
    const canvas = document.getElementById("physics-canvas");
    if (!canvas) return;
    const ctx = M.setupCanvas(canvas, W, H);
    const els = {
      omega: document.getElementById("pl-omega"),
      period: document.getElementById("pl-period"),
      v: document.getElementById("pl-v"),
      a: document.getElementById("pl-a"),
      f: document.getElementById("pl-f"),
      g: document.getElementById("pl-g"),
      meter: document.getElementById("pl-meter"),
      comfort: document.getElementById("pl-comfort"),
    };
    function bind(id, key, outId, fmtOut) {
      const input = document.getElementById(id);
      const out = document.getElementById(outId);
      const apply = function () {
        S[key] = parseFloat(input.value);
        out.textContent = fmtOut(S[key]);
        updateStats(els);
      };
      input.addEventListener("input", apply);
      apply();
    }
    bind("pl-rpm", "rpm", "pl-rpm-out", function (v) { return v + " RPM"; });
    bind("pl-r", "r", "pl-r-out", function (v) { return v.toFixed(1) + " m"; });
    bind("pl-m", "m", "pl-m-out", function (v) { return v + " kg"; });
    document.getElementById("pl-letgo").addEventListener("click", letGo);

    M.animate(canvas, function (dt) {
      update(dt);
      render(ctx);
    });
  }

  M.physicsLab = { init: init };
})(window.MGR);
