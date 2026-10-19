// Gear lab: an "unrolled" crown gear with a crank pinion rolling beneath it.
(function (M) {
  "use strict";

  const P = M.palette;
  const TAU = M.TAU;
  const W = 960, H = 340;
  const RACK_X = 50, RACK_W = 860, RACK_Y = 44;
  const LAP_SECONDS = 9;
  const POLE_LEN = 120;

  const S = { crown: 36, pinion: 12, dist: 0, trail: [], lastLap: 0 };

  function geometry() {
    const pitch = RACK_W / S.crown;
    const r = (S.pinion * pitch) / TAU;      // pitch radius: circumference = teeth × pitch
    const tooth = Math.min(pitch * 0.45, 12);
    return { pitch: pitch, r: r, tooth: tooth, throwR: Math.min(r * 0.62, 34) };
  }

  function update(dt) {
    S.dist += (RACK_W / LAP_SECONDS) * dt;
    const lap = Math.floor(S.dist / RACK_W);
    if (lap !== S.lastLap) { S.lastLap = lap; S.trail = []; }
  }

  function render(ctx) {
    const g = geometry();
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#2a0b5e");
    bg.addColorStop(1, "#4a1590");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Rack (unrolled crown gear) with teeth pointing down
    ctx.fillStyle = "#d9a520";
    M.roundRect(ctx, RACK_X - 10, RACK_Y - 26, RACK_W + 20, 26, 6);
    ctx.fill();
    ctx.fillStyle = "#ffd23f";
    for (let k = 0; k < S.crown; k++) {
      const x0 = RACK_X + k * g.pitch;
      ctx.beginPath();
      ctx.moveTo(x0 + g.pitch * 0.12, RACK_Y);
      ctx.lineTo(x0 + g.pitch * 0.32, RACK_Y + g.tooth);
      ctx.lineTo(x0 + g.pitch * 0.68, RACK_Y + g.tooth);
      ctx.lineTo(x0 + g.pitch * 0.88, RACK_Y);
      ctx.closePath();
      ctx.fill();
    }
    ctx.font = "700 13px Fredoka, sans-serif";
    ctx.fillStyle = P.ink;
    ctx.textAlign = "left";
    ctx.fillText("CROWN GEAR, unrolled: " + S.crown + " teeth · stays still", RACK_X, RACK_Y - 9);

    const lapDist = S.dist % RACK_W;
    const cx = RACK_X + lapDist;
    const cy = RACK_Y + g.tooth / 2 + g.r;
    const ang = -S.dist / g.r; // rolling under the rack → counter-clockwise

    // Pinion gear
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ang);
    ctx.fillStyle = "#ff8c42";
    ctx.beginPath();
    const n = S.pinion;
    const ro = g.r + g.tooth / 2, ri = g.r - g.tooth / 2;
    for (let k = 0; k < n; k++) {
      const a0 = -Math.PI / 2 + (k * TAU) / n;
      const half = TAU / n / 2;
      ctx.lineTo(Math.cos(a0 - half * 0.5) * ri, Math.sin(a0 - half * 0.5) * ri);
      ctx.lineTo(Math.cos(a0 - half * 0.3) * ro, Math.sin(a0 - half * 0.3) * ro);
      ctx.lineTo(Math.cos(a0 + half * 0.3) * ro, Math.sin(a0 + half * 0.3) * ro);
      ctx.lineTo(Math.cos(a0 + half * 0.5) * ri, Math.sin(a0 + half * 0.5) * ri);
      ctx.lineTo(Math.cos(a0 + half * 1.5) * ri, Math.sin(a0 + half * 1.5) * ri);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(29,8,72,0.35)";
    ctx.beginPath();
    ctx.arc(0, 0, ri * 0.7, 0, TAU);
    ctx.fill();
    // Crank arm (the "throw")
    ctx.strokeStyle = "#e8ecff";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(g.throwR, 0);
    ctx.stroke();
    ctx.restore();

    const pinX = cx + Math.cos(ang) * g.throwR;
    const pinY = cy + Math.sin(ang) * g.throwR;

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, TAU);
    ctx.fill();

    // The horse hangs from the crank pin on a pole kept vertical by a guide
    const horseY = pinY + POLE_LEN;
    const hx = cx;
    S.trail.push({ x: hx, y: horseY });

    ctx.strokeStyle = "rgba(255,210,63,0.75)";
    ctx.lineWidth = 3;
    ctx.setLineDash([3, 7]);
    ctx.beginPath();
    S.trail.forEach(function (p, i) { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
    ctx.stroke();
    ctx.setLineDash([]);

    // Pole
    const pg = ctx.createLinearGradient(hx - 4, 0, hx + 4, 0);
    pg.addColorStop(0, "#b8860b");
    pg.addColorStop(0.5, "#fff1a8");
    pg.addColorStop(1, "#b8860b");
    ctx.strokeStyle = pg;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(pinX, pinY);
    ctx.lineTo(hx, horseY + 40);
    ctx.stroke();
    ctx.fillStyle = P.pink;
    ctx.beginPath();
    ctx.arc(pinX, pinY, 6, 0, TAU);
    ctx.fill();

    M.drawHorse(ctx, hx, horseY, 1.05, 1, 1, M.horseColors[0], false);

    // Labels
    M.pill(ctx, "Crank pinion: " + S.pinion + " teeth", Math.min(cx + g.r + 100, W - 90), cy, {
      size: 13, bg: "rgba(29,8,72,0.9)", border: P.orange,
    });
    ctx.font = "700 13px Fredoka, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.textAlign = "right";
    ctx.fillText("carried around by the ride →", W - 24, H - 18);
    ctx.textAlign = "left";
    const turns = lapDist / (g.r * TAU);
    ctx.fillText("Crank turns this lap: " + turns.toFixed(1) + " / " + (S.crown / S.pinion).toFixed(1), 24, H - 18);
  }

  function init() {
    const canvas = document.getElementById("gear-canvas");
    if (!canvas) return;
    const ctx = M.setupCanvas(canvas, W, H);
    const crown = document.getElementById("gl-crown");
    const pinion = document.getElementById("gl-pinion");
    const crownOut = document.getElementById("gl-crown-out");
    const pinionOut = document.getElementById("gl-pinion-out");
    const ratio = document.getElementById("gl-ratio");
    const eq = document.getElementById("gl-ratio-eq");

    function apply() {
      // Keep the pinion at most half the crown so the drawing fits.
      if (parseInt(pinion.value, 10) > parseInt(crown.value, 10) / 2) pinion.value = String(crown.value / 2);
      S.crown = parseInt(crown.value, 10);
      S.pinion = parseInt(pinion.value, 10);
      crownOut.textContent = S.crown;
      pinionOut.textContent = S.pinion;
      const r = S.crown / S.pinion;
      const nice = Number.isInteger(r) ? String(r) : r.toFixed(2);
      ratio.textContent = nice;
      eq.textContent = S.crown + " ÷ " + S.pinion + " = " + nice;
      S.dist = 0;
      S.lastLap = 0;
      S.trail = [];
    }
    crown.addEventListener("input", apply);
    pinion.addEventListener("input", apply);
    apply();

    M.animate(canvas, function (dt) {
      update(dt);
      render(ctx);
    });
  }

  M.gearLab = { init: init };
})(window.MGR);
